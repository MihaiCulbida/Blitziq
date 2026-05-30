<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm'] ?? '';

if (!$username || !$email || !$password || !$confirm) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Username must be 3-30 characters (letters, numbers, underscores).']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

$file  = __DIR__ . '/data/users.json';
$users = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

foreach ($users as $u) {
    if ($u['username'] === $username || $u['email'] === $email) {
        echo json_encode(['success' => false, 'message' => 'Username or email already taken.']);
        exit;
    }
}

$users[] = [
    'id' => time(),
    'username' => $username,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_BCRYPT),
];

file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));

session_regenerate_id(true);
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'username' => $username]);