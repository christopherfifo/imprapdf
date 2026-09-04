<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Impressão</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
        }
        .pdf-item {
            transition: background-color 0.2s;
        }
        .pdf-item:hover {
            background-color: #f8fafc;
        }
        #printBar {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            background-color: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
        }
        .file-checkbox {
            width: 1.25rem;
            height: 1.25rem;
        }
    </style>
</head>
<body class="bg-light pb-5">

<div class="container mt-4 mb-5 pb-5" style="max-width: 900px;">
    <h1 class="text-center mb-4 fw-bold" style="color: #0f172a;">Gerenciador de Impressão</h1>

    <!-- Abas -->
    <ul class="nav nav-pills nav-fill mb-4 p-1 bg-white rounded shadow-sm" id="pdfTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active fw-bold py-2" id="triagem-tab" data-bs-toggle="tab" data-tab="triagem" type="button" role="tab">📂 Triagem</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold py-2" id="tutoriais-tab" data-bs-toggle="tab" data-tab="tutoriais" type="button" role="tab">📚 Tutoriais</button>
        </li>
    </ul>

    <!-- Configuração de Pasta -->
    <div class="card mb-4 border-0 shadow-sm">
        <div class="card-header bg-white border-bottom-0 pt-3 pb-1">
            <h5 class="card-title mb-1 fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-folder2-open text-secondary"></i> Caminho da Pasta Atual
            </h5>
            <div class="text-muted font-monospace bg-light p-2 rounded mt-2 text-break" id="currentDirDisplay" style="font-size: 0.85rem;">Carregando...</div>
        </div>
        <div class="card-body">
            <div class="d-flex gap-2">
                <input type="text" class="form-control" id="customPathInput" placeholder="Opcional: Cole um caminho do seu PC (Ex: C:\Meus PDFs)">
                <button class="btn btn-secondary text-nowrap" id="loadPathBtn">Carregar Caminho</button>
            </div>
        </div>
    </div>

    <!-- Barra de Pesquisa -->
    <div class="input-group mb-4 shadow-sm">
        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control form-control-lg border-start-0 ps-0" id="searchInput" placeholder="Pesquisar PDF por nome..." style="font-size: 1rem;">
    </div>

    <!-- Lista de Arquivos -->
    <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-2" id="pdfListContainer" style="max-height: 450px; overflow-y: auto;">
            <!-- Arquivos injetados via JS -->
            
            <!-- Empty state -->
            <div class="text-center text-muted p-5" id="emptyState" style="display: none;">
                <i class="bi bi-file-earmark-text" style="font-size: 3.5rem; opacity: 0.2;"></i>
                <p class="mt-3">Nenhum PDF encontrado nesta pasta.</p>
            </div>
        </div>
    </div>

    <!-- Barra de Impressão -->
    <div class="border rounded-pill p-3 d-flex flex-row justify-content-between align-items-center" id="printBar">
        <span class="badge bg-secondary bg-opacity-10 text-dark fs-6 px-3 py-2 border rounded-pill" id="selectedCountDisplay">
            0 arquivo(s) selecionado(s)
        </span>
        <button class="btn btn-primary btn-lg fw-bold px-4 shadow-sm rounded-pill" id="printBtn" disabled>
            <i class="bi bi-printer-fill me-2"></i> <span id="printBtnText">Imprimir Selecionados</span>
        </button>
    </div>

    <iframe id="printFrame" class="d-none"></iframe>
</div>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
