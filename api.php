<?php
require_once __DIR__ . '/classes/PdfManager.php';

$action = $_GET['action'] ?? '';

$pdfManager = new PdfManager();

if ($action === 'list') {
    header('Content-Type: application/json');
    $tab = $_GET['tab'] ?? 'triagem';
    $customPath = $_GET['customPath'] ?? '';
    
    $result = $pdfManager->getFiles($tab, $customPath);
    echo json_encode($result);
    exit;
} elseif ($action === 'file') {
    $path = $_GET['path'] ?? '';
    $pdfManager->serveFile($path);
    exit;
}

header('Content-Type: application/json');
http_response_code(400);
echo json_encode(['error' => 'Ação inválida']);
