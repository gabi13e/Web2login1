<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login to manage your cart']);
    exit;
}

$action  = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'];

switch ($action) {
    case 'add':      addToCart($conn, $user_id);      break;
    case 'get':      getCart($conn, $user_id);        break;
    case 'update':   updateCart($conn, $user_id);     break;
    case 'remove':   removeFromCart($conn, $user_id); break;
    case 'clear':    clearCart($conn, $user_id);      break;
    case 'checkout': checkout($conn, $user_id);       break;
    default:         echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// ─── ADD TO CART ─────────────────────────────────────────────
// Checks: product exists, not archived, in_stock=1, enough quantity
function addToCart($conn, $user_id) {
    $product_id = intval($_POST['product_id'] ?? 0);
    $quantity   = intval($_POST['quantity']   ?? 1);

    if ($product_id <= 0 || $quantity <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product or quantity']);
        return;
    }

    // Fetch product — must be in stock, not archived, and have enough qty
    $stmt = $conn->prepare("
        SELECT id, name, price, quantity
        FROM products
        WHERE id = ? AND in_stock = 1
          AND (archived = 0 OR archived IS NULL)
    ");
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $result  = $stmt->get_result();
    $product = $result->fetch_assoc();

    if (!$product) {
        echo json_encode(['success' => false, 'message' => 'Product is not available']);
        return;
    }

    // How many are already in this user's cart?
    $stmt2 = $conn->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt2->bind_param("ii", $user_id, $product_id);
    $stmt2->execute();
    $cartRow   = $stmt2->get_result()->fetch_assoc();
    $inCart    = $cartRow ? $cartRow['quantity'] : 0;
    $totalWant = $inCart + $quantity;

    // Check against actual stock
    if ($product['quantity'] !== null && $totalWant > $product['quantity']) {
        $available = max(0, $product['quantity'] - $inCart);
        if ($available <= 0) {
            echo json_encode(['success' => false, 'message' => 'No more stock available for this item']);
        } else {
            echo json_encode(['success' => false, 'message' => "Only {$available} more available (you already have {$inCart} in cart)"]);
        }
        return;
    }

    // Insert or update cart
    if ($cartRow) {
        $stmt3 = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt3->bind_param("iii", $totalWant, $user_id, $product_id);
        $stmt3->execute();
    } else {
        $stmt3 = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt3->bind_param("iii", $user_id, $product_id, $quantity);
        $stmt3->execute();
    }

    echo json_encode(['success' => true, 'message' => 'Item added to cart']);
}

// ─── GET CART ─────────────────────────────────────────────────
function getCart($conn, $user_id) {
    $stmt = $conn->prepare("
        SELECT c.id, c.product_id, c.quantity,
               p.name, p.description, p.price, p.image_url,
               p.quantity AS stock,
               p.in_stock,
               (c.quantity * p.price) AS subtotal
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    $total = 0;

    while ($row = $result->fetch_assoc()) {
        // Flag if cart qty exceeds current stock (stock may have changed)
        $row['stock_warning'] = ($row['stock'] !== null && $row['quantity'] > $row['stock']);
        $items[] = $row;
        $total  += $row['subtotal'];
    }

    echo json_encode([
        'success' => true,
        'items'   => $items,
        'total'   => $total,
        'count'   => count($items)
    ]);
}

// ─── UPDATE CART ──────────────────────────────────────────────
function updateCart($conn, $user_id) {
    $cart_id  = intval($_POST['cart_id']  ?? 0);
    $quantity = intval($_POST['quantity'] ?? 1);

    if ($cart_id <= 0 || $quantity < 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid cart item or quantity']);
        return;
    }

    if ($quantity === 0) {
        $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $cart_id, $user_id);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Item removed']);
        return;
    }

    // Validate against stock before updating
    $stmt = $conn->prepare("
        SELECT p.quantity AS stock
        FROM cart c JOIN products p ON c.product_id = p.id
        WHERE c.id = ? AND c.user_id = ?
    ");
    $stmt->bind_param("ii", $cart_id, $user_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if ($row && $row['stock'] !== null && $quantity > $row['stock']) {
        echo json_encode(['success' => false, 'message' => "Only {$row['stock']} in stock"]);
        return;
    }

    $stmt2 = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?");
    $stmt2->bind_param("iii", $quantity, $cart_id, $user_id);
    $stmt2->execute();
    echo json_encode(['success' => true, 'message' => 'Cart updated']);
}

// ─── REMOVE FROM CART ─────────────────────────────────────────
function removeFromCart($conn, $user_id) {
    $cart_id = intval($_POST['cart_id'] ?? 0);
    if ($cart_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid cart item']);
        return;
    }
    $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $cart_id, $user_id);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'Item removed from cart']);
}

// ─── CLEAR CART ───────────────────────────────────────────────
function clearCart($conn, $user_id) {
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'Cart cleared']);
}

// ─── CHECKOUT ─────────────────────────────────────────────────
// 1. Validates every item has enough stock
// 2. Creates order + order_items in a transaction
// 3. Deducts quantity from products table
// 4. Sets in_stock = 0 automatically when quantity reaches 0
// 5. Clears the cart
function checkout($conn, $user_id) {
    // Get all cart items with current stock
    $stmt = $conn->prepare("
        SELECT c.id AS cart_id, c.product_id, c.quantity AS cart_qty,
               p.name, p.price, p.quantity AS stock, p.in_stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    if (empty($items)) {
        echo json_encode(['success' => false, 'message' => 'Your cart is empty']);
        return;
    }

    // ── Validate stock for every item BEFORE touching the DB ──
    $errors = [];
    foreach ($items as $item) {
        if (!$item['in_stock']) {
            $errors[] = "{$item['name']} is no longer available";
            continue;
        }
        if ($item['stock'] !== null && $item['cart_qty'] > $item['stock']) {
            $errors[] = "{$item['name']}: only {$item['stock']} left (you want {$item['cart_qty']})";
        }
    }
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => 'Stock issue: ' . implode('; ', $errors)
        ]);
        return;
    }

    // ── Calculate total ──
    $total = array_sum(array_map(fn($i) => $i['cart_qty'] * $i['price'], $items));

    // ── Begin transaction ──
    $conn->begin_transaction();
    try {
        // Create order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("id", $user_id, $total);
        $stmt->execute();
        $order_id = $conn->insert_id;

        // Insert order items + deduct stock
        foreach ($items as $item) {
            // Insert order item
            $stmt2 = $conn->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt2->bind_param("iisd", $order_id, $item['product_id'], $item['name'], $item['cart_qty'], $item['price']);
            // Note: bind_param types: i=int, i=int, s=string, d=double, d=double → "iisdd"
            $stmt2 = $conn->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt2->bind_param("iisid", $order_id, $item['product_id'], $item['name'], $item['cart_qty'], $item['price']);
            $stmt2->execute();

            // Deduct quantity and auto-set in_stock = 0 when depleted
            $stmt3 = $conn->prepare("
                UPDATE products
                SET quantity  = GREATEST(0, quantity - ?),
                    in_stock  = IF(quantity - ? <= 0, 0, 1)
                WHERE id = ?
            ");
            $stmt3->bind_param("iii", $item['cart_qty'], $item['cart_qty'], $item['product_id']);
            $stmt3->execute();
        }

        // Clear cart
        $stmt4 = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt4->bind_param("i", $user_id);
        $stmt4->execute();

        $conn->commit();

        echo json_encode([
            'success'  => true,
            'message'  => 'Order placed successfully!',
            'order_id' => $order_id,
            'total'    => $total
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Checkout failed. Please try again.']);
    }
}

$conn->close();
?>