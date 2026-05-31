<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$identifier = trim($_POST['identifier'] ?? '');
$password   = $_POST['password'] ?? '';

if (!$identifier || !$password) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

$file  = __DIR__ . '/data/users.json';
$users = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

foreach ($users as $u) {
    if (($u['username'] === $identifier || $u['email'] === $identifier) && password_verify($password, $u['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id']  = $u['id'] ?? $u['username'];
        $_SESSION['username'] = $u['username'];
        echo json_encode(['success' => true, 'username' => $u['username']]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);