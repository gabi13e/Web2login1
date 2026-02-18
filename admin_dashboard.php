<?php
require_once 'config.php';

header('Content-Type: application/json');

// Check if user is logged in and is admin (supports both session styles)
$isAdminSession = isset($_SESSION['admin_id']) && isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
$isUserAdmin    = isset($_SESSION['user_id'])  && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';

if (!$isAdminSession && !$isUserAdmin) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Normalize user_id so rest of file works consistently
if (!isset($_SESSION['user_id']) && isset($_SESSION['admin_id'])) {
    $_SESSION['user_id'] = $_SESSION['admin_id'];
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    // PRODUCTS CRUD
    case 'get_products':
        getProducts($conn);
        break;
    case 'get_archived_products':
        getArchivedProducts($conn);
        break;
    case 'restore_product':
        restoreProduct($conn);
        break;
    case 'get_product':
        getProduct($conn);
        break;
    case 'create_product':
        createProduct($conn);
        break;
    case 'update_product':
        updateProduct($conn);
        break;
    case 'delete_product':
        deleteProduct($conn);
        break;

    // ORDERS CRUD
    case 'get_orders':
        getOrders($conn);
        break;
    case 'get_order':
        getOrder($conn);
        break;
    case 'update_order_status':
        updateOrderStatus($conn);
        break;
    case 'delete_order':
        deleteOrder($conn);
        break;

    // USERS CRUD
    case 'get_users':
        getUsers($conn);
        break;
    case 'get_user':
        getUser($conn);
        break;
    case 'update_user':
        updateUser($conn);
        break;
    case 'delete_user':
        deleteUser($conn);
        break;

    // CONTACT MESSAGES
    case 'get_messages':
        getMessages($conn);
        break;
    case 'delete_message':
        deleteMessage($conn);
        break;
    case 'update_message_status':
        updateMessageStatus($conn);
        break;

    // DASHBOARD STATS
    case 'get_stats':
        getStats($conn);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// ============= PRODUCTS =============
function getProducts($conn) {
    $stmt = $conn->prepare("SELECT * FROM products WHERE archived = 0 OR archived IS NULL ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode(['success' => true, 'products' => $products]);
}

function getProduct($conn) {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();
    
    if ($product) {
        echo json_encode(['success' => true, 'product' => $product]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
    }
}

function createProduct($conn) {
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $category = trim($_POST['category'] ?? '');
    $image_url = trim($_POST['image_url'] ?? '');
    $hover_image_url = trim($_POST['hover_image_url'] ?? '');
    $featured_image_url = trim($_POST['featured_image_url'] ?? '');
    $badge = trim($_POST['badge'] ?? '') ?: null;
    $in_stock = isset($_POST['in_stock']) ? 1 : 0;

    if (empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product data']);
        return;
    }

    $stmt = $conn->prepare("INSERT INTO products (name, description, price, category, image_url, hover_image_url, featured_image_url, badge, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdsssssi", $name, $description, $price, $category, $image_url, $hover_image_url, $featured_image_url, $badge, $in_stock);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product created successfully', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating product']);
    }
}

function updateProduct($conn) {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $category = trim($_POST['category'] ?? '');
    $image_url = trim($_POST['image_url'] ?? '');
    $hover_image_url = trim($_POST['hover_image_url'] ?? '');
    $featured_image_url = trim($_POST['featured_image_url'] ?? '');
    $badge = trim($_POST['badge'] ?? '') ?: null;
    $in_stock = isset($_POST['in_stock']) ? 1 : 0;

    if (empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product data']);
        return;
    }

    $stmt = $conn->prepare("UPDATE products SET name=?, description=?, price=?, category=?, image_url=?, hover_image_url=?, featured_image_url=?, badge=?, in_stock=? WHERE id=?");
    $stmt->bind_param("ssdssssii", $name, $description, $price, $category, $image_url, $hover_image_url, $featured_image_url, $badge, $in_stock, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating product']);
    }
}

function deleteProduct($conn) {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $conn->prepare("UPDATE products SET archived = 1, archived_at = NOW() WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product archived successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error archiving product']);
    }
}

function getArchivedProducts($conn) {
    $stmt = $conn->prepare("SELECT * FROM products WHERE archived = 1 ORDER BY archived_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) { $products[] = $row; }
    echo json_encode(['success' => true, 'products' => $products]);
}

function restoreProduct($conn) {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $conn->prepare("UPDATE products SET archived = 0, archived_at = NULL WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product restored successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error restoring product']);
    }
}

// ============= ORDERS =============
function getOrders($conn) {
    $stmt = $conn->prepare("SELECT o.*, u.name as user_name, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    echo json_encode(['success' => true, 'orders' => $orders]);
}

function getOrder($conn) {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $conn->prepare("SELECT o.*, u.name as user_name, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();
    
    if ($order) {
        // Get order items
        $itemStmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->bind_param("i", $id);
        $itemStmt->execute();
        $itemResult = $itemStmt->get_result();
        $items = [];
        while ($row = $itemResult->fetch_assoc()) {
            $items[] = $row;
        }
        $order['items'] = $items;
        echo json_encode(['success' => true, 'order' => $order]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
    }
}

function updateOrderStatus($conn) {
    $id = intval($_POST['id'] ?? 0);
    $status = trim($_POST['status'] ?? '');

    $allowed_statuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!in_array($status, $allowed_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        return;
    }

    $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating order']);
    }
}

function deleteOrder($conn) {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting order']);
    }
}

// ============= USERS =============
function getUsers($conn) {
    $stmt = $conn->prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode(['success' => true, 'users' => $users]);
}

function getUser($conn) {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $conn->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

function updateUser($conn) {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $role = trim($_POST['role'] ?? 'customer');

    if (empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Invalid user data']);
        return;
    }

    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?");
    $stmt->bind_param("sssi", $name, $email, $role, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating user']);
    }
}

function deleteUser($conn) {
    $id = intval($_POST['id'] ?? 0);
    
    // Prevent deleting yourself
    if ($id === $_SESSION['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Cannot delete your own account']);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting user']);
    }
}

// ============= CONTACT MESSAGES =============
function getMessages($conn) {
    $stmt = $conn->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    echo json_encode(['success' => true, 'messages' => $messages]);
}

function deleteMessage($conn) {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Message deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting message']);
    }
}

function updateMessageStatus($conn) {
    $id = intval($_POST['id'] ?? 0);
    $status = trim($_POST['status'] ?? '');

    $allowed_statuses = ['unread', 'read', 'replied'];
    if (!in_array($status, $allowed_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        return;
    }

    $stmt = $conn->prepare("UPDATE contact_messages SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Message status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating message']);
    }
}

// ============= DASHBOARD STATS =============
function getStats($conn) {
    $stats = [];

    // Total products
    $result = $conn->query("SELECT COUNT(*) as count FROM products");
    $stats['products'] = $result->fetch_assoc()['count'];

    // Total users
    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    $stats['customers'] = $result->fetch_assoc()['count'];

    // Total orders
    $result = $conn->query("SELECT COUNT(*) as count FROM orders");
    $stats['orders'] = $result->fetch_assoc()['count'];

    // Total revenue
    $result = $conn->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
    $row = $result->fetch_assoc();
    $stats['revenue'] = $row['total'] ?? 0;

    // Pending messages
    $result = $conn->query("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'");
    $stats['pending_messages'] = $result->fetch_assoc()['count'];

    // Recent orders
    $stmt = $conn->prepare("SELECT o.id, o.total_amount, o.status, u.name, o.created_at FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5");
    $stmt->execute();
    $result = $stmt->get_result();
    $recent_orders = [];
    while ($row = $result->fetch_assoc()) {
        $recent_orders[] = $row;
    }
    $stats['recent_orders'] = $recent_orders;

    echo json_encode(['success' => true, 'stats' => $stats]);
}

$conn->close();
?>