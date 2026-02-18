<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'    => $_SESSION['user_id'],
            'name'  => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role'  => $_SESSION['user_role'] ?? 'customer'
        ]
    ]);
} elseif (isset($_SESSION['admin_id'])) {
    // Fallback for admin-only session
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'    => $_SESSION['admin_id'],
            'name'  => $_SESSION['admin_name'],
            'email' => $_SESSION['admin_email'],
            'role'  => 'admin'
        ]
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}