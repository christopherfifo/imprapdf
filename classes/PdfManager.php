<?php

class PdfManager {
    private $baseDir;

    public function __construct($baseDir = null) {
        // Acessa a pasta 'pdfs' dentro do próprio diretório do projeto PHP
        $this->baseDir = $baseDir ?: realpath(__DIR__ . '/../pdfs');
        
        // Se não conseguir encontrar o caminho com realpath (pasta não existe), define manualmente
        if (!$this->baseDir) {
            $this->baseDir = __DIR__ . '/../pdfs';
        }
    }

    public function getFiles($tab = 'triagem', $customPath = '') {
        $targetDir = $this->baseDir . DIRECTORY_SEPARATOR . $tab;

        // Se o usuário digitou um caminho personalizado e ele existe, usa ele
        if (!empty($customPath) && is_dir($customPath)) {
            $targetDir = $customPath;
        }

        // Se a pasta não existir, tenta criar
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0777, true);
        }

        $files = [];
        if (is_dir($targetDir)) {
            $dirFiles = scandir($targetDir);
            foreach ($dirFiles as $file) {
                if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf') {
                    $files[] = [
                        'name' => $file,
                        'fullPath' => $targetDir . DIRECTORY_SEPARATOR . $file
                    ];
                }
            }
        }

        return [
            'files' => $files,
            'currentDir' => $targetDir
        ];
    }

    public function serveFile($path) {
        if (!empty($path) && file_exists($path)) {
            header('Content-Type: application/pdf');
            header('Content-Length: ' . filesize($path));
            header('Content-Disposition: inline; filename="' . basename($path) . '"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            
            readfile($path);
            exit;
        } else {
            http_response_code(404);
            echo "Arquivo não encontrado";
            exit;
        }
    }
}
