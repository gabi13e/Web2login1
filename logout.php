<?php
require_once 'config.php';

// Destroy session
session_unset();
session_destroy();

// Send JSON response
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>