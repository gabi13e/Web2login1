<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list': getProducts($conn); break;
    case 'get':  getProduct($conn);  break;
    default:     echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// Show ALL non-archived products (in_stock=0 means Out of Stock, still shows)
// quantity is intentionally excluded — admin-only info
function getProducts($conn) {
    $category = $_GET['category'] ?? '';

    if ($category) {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, category,
                   image_url, hover_image_url, featured_image_url,
                   badge, in_stock
            FROM products
            WHERE category = ?
              AND (archived = 0 OR archived IS NULL)
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("s", $category);
    } else {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, category,
                   image_url, hover_image_url, featured_image_url,
                   badge, in_stock
            FROM products
            WHERE (archived = 0 OR archived IS NULL)
            ORDER BY created_at DESC
        ");
    }

    $stmt->execute();
    $result   = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    echo json_encode([
        'success'  => true,
        'products' => $products,
        'count'    => count($products)
    ]);
}

// Single product — always show even if out of stock (so page can display the status)
function getProduct($conn) {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        return;
    }

    $stmt = $conn->prepare("
        SELECT id, name, description, price, category,
               image_url, hover_image_url, featured_image_url,
               badge, in_stock
        FROM products
        WHERE id = ?
          AND (archived = 0 OR archived IS NULL)
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result  = $stmt->get_result();
    $product = $result->fetch_assoc();

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        return;
    }

    echo json_encode(['success' => true, 'product' => $product]);
}

$conn->close();
?>