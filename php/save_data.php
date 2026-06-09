<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$dir = dirname(__DIR__) . '/data';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

$file = $dir . '/user_' . $_SESSION['user_id'] . '_data.json';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }
    
    $allowed = ['quizzes', 'folders', 'saved', 'notifs', 'history'];
    $clean = [];
    foreach ($allowed as $key) {
        if (isset($data[$key])) {
            $clean[$key] = $data[$key];
        }
    }
    
    file_put_contents($file, json_encode($clean, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => true, 'data' => [
            'quizzes' => [],
            'folders' => [],
            'saved' => [],
            'notifs' => [],
            'history' => []
        ]]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);