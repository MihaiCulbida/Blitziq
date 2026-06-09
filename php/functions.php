<?php
function loadUsers(): array {
    $file = dirname(__DIR__) . '/data/users.json';
    return file_exists($file) ? json_decode(file_get_contents($file), true) : [];
}

function saveUsers(array $users): void {
    file_put_contents(dirname(__DIR__) . '/data/users.json', json_encode($users, JSON_PRETTY_PRINT));
}

function findUser(string $identifier): ?array {
    foreach (loadUsers() as $u) {
        if ($u['username'] === $identifier || $u['email'] === $identifier) return $u;
    }
    return null;
}

function sendJson(array $data): void {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function requireAuth(): void {
    if (!isset($_SESSION['user_id'])) {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            sendJson(['success' => false, 'message' => 'Not authenticated.']);
        }
        if (!empty($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json')) {
            sendJson(['success' => false, 'message' => 'Not authenticated.']);
        }
        header('Location: index.php');
        exit;
    }
}