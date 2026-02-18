<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        getProducts($conn);
        break;
    
    case 'get':
        getProduct($conn);
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getProducts($conn) {
    $category = $_GET['category'] ?? '';
    
    if ($category) {
        $stmt = $conn->prepare("SELECT * FROM products WHERE category = ? AND in_stock = 1 ORDER BY created_at DESC");
        $stmt->bind_param("s", $category);
    } else {
        $stmt = $conn->prepare("SELECT * FROM products WHERE in_stock = 1 AND (archived = 0 OR archived IS NULL) ORDER BY created_at DESC");
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'products' => $products,
        'count' => count($products)
    ]);
}

function getProduct($conn) {
    $id = intval($_GET['id'] ?? 0);
    
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        return;
    }
    
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        return;
    }
    
    $product = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'product' => $product
    ]);
}

$conn->close();
?>