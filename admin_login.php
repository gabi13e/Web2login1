<?php
require_once 'config.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Sanitize inputs
$username      = trim($_POST['username']      ?? '');
$email         = trim($_POST['email']         ?? '');
$password      =       $_POST['password']      ?? '';
$security_code = trim($_POST['security_code'] ?? '');

// Basic validation
if (!$username || !$email || !$password || !$security_code) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (strlen($security_code) !== 6) {
    echo json_encode(['success' => false, 'message' => 'Security code must be 6 characters']);
    exit;
}

// Look up admin by username AND email
$stmt = $conn->prepare("
    SELECT id, username, name, email, password, role, security_code, is_active
    FROM users
    WHERE username = ? AND email = ? AND role = 'admin'
    LIMIT 1
");
$stmt->bind_param('ss', $username, $email);
$stmt->execute();
$result = $stmt->get_result();
$admin  = $result->fetch_assoc();
$stmt->close();

// Validate admin exists and is active
if (!$admin) {
    echo json_encode(['success' => false, 'message' => 'Invalid admin credentials']);
    exit;
}

if (!$admin['is_active']) {
    echo json_encode(['success' => false, 'message' => 'This admin account has been disabled']);
    exit;
}

// Verify password
if (!password_verify($password, $admin['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid admin credentials']);
    exit;
}

// Verify security code (plain comparison since it's stored as plain text)
if ($security_code !== $admin['security_code']) {
    echo json_encode(['success' => false, 'message' => 'Invalid security code']);
    exit;
}

// All checks passed — create session (both admin_* and user_* for full compatibility)
$_SESSION['admin_id']       = $admin['id'];
$_SESSION['admin_name']     = $admin['name'];
$_SESSION['admin_username'] = $admin['username'];
$_SESSION['admin_email']    = $admin['email'];
$_SESSION['admin_role']     = $admin['role'];
$_SESSION['is_admin']       = true;
// Standard user session variables — required by admin_dashboard.php and check_session.php
$_SESSION['user_id']        = $admin['id'];
$_SESSION['user_name']      = $admin['name'];
$_SESSION['user_email']     = $admin['email'];
$_SESSION['user_role']      = 'admin';

echo json_encode([
    'success'  => true,
    'message'  => 'Admin access granted!',
    'redirect' => 'admin_dashboard.html',
    'admin'    => [
        'id'       => $admin['id'],
        'name'     => $admin['name'],
        'username' => $admin['username'],
        'email'    => $admin['email'],
    ]
]);