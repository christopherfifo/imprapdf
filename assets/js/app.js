document.addEventListener('DOMContentLoaded', () => {
    let currentTab = 'triagem';
    let customPath = '';
    let files = [];
    let selected = {};
    let copies = {};
    let isPrinting = false;

    const currentDirDisplay = document.getElementById('currentDirDisplay');
    const customPathInput = document.getElementById('customPathInput');
    const loadPathBtn = document.getElementById('loadPathBtn');
    const searchInput = document.getElementById('searchInput');
    const pdfListContainer = document.getElementById('pdfListContainer');
    const emptyState = document.getElementById('emptyState');
    const selectedCountDisplay = document.getElementById('selectedCountDisplay');
    const printBtn = document.getElementById('printBtn');
    const printBtnText = document.getElementById('printBtnText');
    const unselectAllBtn = document.getElementById('unselectAllBtn');
    const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');

    // Tabs
    const tabButtons = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabButtons.forEach(btn => {
        btn.addEventListener('shown.bs.tab', (e) => {
            currentTab = e.target.dataset.tab;
            selected = {};
            updateSelectedCount();
            fetchFiles();
        });
    });

    // Load custom path
    loadPathBtn.addEventListener('click', () => {
        customPath = customPathInput.value;
        fetchFiles();
    });

    customPathInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            customPath = customPathInput.value;
            fetchFiles();
        }
    });

    // Search
    searchInput.addEventListener('input', () => {
        renderList();
    });

    // Print
    printBtn.addEventListener('click', handlePrint);

    async function fetchFiles() {
        try {
            const res = await fetch(`api.php?action=list&tab=${currentTab}&customPath=${encodeURIComponent(customPath)}`);
            const data = await res.json();
            files = data.files || [];
            currentDirDisplay.textContent = data.currentDir || 'Pasta não encontrada';
            renderList();
        } catch (err) {
            console.error('Erro ao buscar arquivos:', err);
        }
    }

    function renderList() {
        // Clear current list items, keeping emptyState
        const items = pdfListContainer.querySelectorAll('.pdf-item');
        items.forEach(item => item.remove());

        const query = searchInput.value.toLowerCase();
        const filteredFiles = files.filter(f => f.name.toLowerCase().includes(query));

        if (filteredFiles.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredFiles.forEach(file => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'pdf-item d-flex justify-content-between align-items-center p-3 mb-2 rounded border bg-white shadow-sm';
                
                const isChecked = selected[file.fullPath] ? 'checked' : '';
                const qty = copies[file.fullPath] || 1;
                
                // Usando btoa pra gerar IDs seguros no DOM
                const inputId = `chk-${btoa(encodeURIComponent(file.fullPath)).replace(/=/g, '')}`;

                itemDiv.innerHTML = `
                    <div class="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
                        <div class="form-check m-0">
                            <input class="form-check-input file-checkbox" type="checkbox" id="${inputId}" data-path="${file.fullPath}" ${isChecked}>
                        </div>
                        <label class="form-check-label fw-medium text-truncate m-0 flex-grow-1" for="${inputId}" style="cursor: pointer; user-select: none;">
                            ${file.name}
                        </label>
                    </div>
                    <div class="d-flex align-items-center gap-2 ms-3 bg-light p-2 rounded">
                        <button class="btn btn-sm btn-outline-success download-single-btn" data-path="${file.fullPath}" title="Baixar este arquivo">
                            <i class="bi bi-download"></i>
                        </button>
                        <label class="form-label m-0 text-uppercase text-secondary" style="font-size: 0.70rem; font-weight: 700; letter-spacing: 0.5px;">Cópias</label>
                        <input type="number" min="1" max="50" class="form-control form-control-sm text-center copy-input fw-bold" data-path="${file.fullPath}" value="${qty}" style="width: 60px;">
                    </div>
                `;

                pdfListContainer.insertBefore(itemDiv, emptyState);
            });

            // Attach events
            document.querySelectorAll('.file-checkbox').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const path = e.target.dataset.path;
                    selected[path] = e.target.checked;
                    updateSelectedCount();
                });
            });

            document.querySelectorAll('.copy-input').forEach(inp => {
                inp.addEventListener('change', (e) => {
                    const path = e.target.dataset.path;
                    let val = parseInt(e.target.value) || 1;
                    if (val < 1) val = 1;
                    e.target.value = val;
                    copies[path] = val;
                });
            });

            document.querySelectorAll('.download-single-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const path = e.currentTarget.dataset.path;
                    downloadSingleFile(path);
                });
            });
        }
    }

    function updateSelectedCount() {
        const count = Object.values(selected).filter(Boolean).length;
        selectedCountDisplay.textContent = `${count} arquivo(s) selecionado(s)`;
        printBtn.disabled = isPrinting || count === 0;
        downloadSelectedBtn.disabled = isPrinting || count === 0;
        unselectAllBtn.style.display = count > 0 ? 'inline-block' : 'none';
    }

    unselectAllBtn.addEventListener('click', () => {
        selected = {};
        updateSelectedCount();
        renderList();
    });

    downloadSelectedBtn.addEventListener('click', () => {
        const selectedFiles = files.filter(f => selected[f.fullPath]);
        if (selectedFiles.length === 0) return alert('Selecione pelo menos um PDF.');
        
        selectedFiles.forEach(file => {
            downloadSingleFile(file.fullPath);
        });
    });

    function downloadSingleFile(path) {
        const link = document.createElement('a');
        link.href = `api.php?action=file&path=${encodeURIComponent(path)}`;
        link.download = path.split(/[\/\\]/).pop() || 'arquivo.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function handlePrint() {
        const selectedFiles = files.filter(f => selected[f.fullPath]);
        if (selectedFiles.length === 0) return alert('Selecione pelo menos um PDF.');

        isPrinting = true;
        updateSelectedCount();
        printBtnText.textContent = 'Gerando Documento...';

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of selectedFiles) {
                const fileCopies = copies[file.fullPath] || 1;
                const res = await fetch(`api.php?action=file&path=${encodeURIComponent(file.fullPath)}`);
                
                if (!res.ok) {
                    console.error('Erro ao baixar', file.name);
                    continue;
                }
                
                const arrayBuffer = await res.arrayBuffer();
                
                const loadedPdf = await PDFDocument.load(arrayBuffer);
                const pageIndices = loadedPdf.getPageIndices();

                for (let i = 0; i < fileCopies; i++) {
                    const copiedPages = await mergedPdf.copyPages(loadedPdf, pageIndices);
                    copiedPages.forEach(p => mergedPdf.addPage(p));
                }
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            const iframe = document.getElementById('printFrame');
            iframe.src = blobUrl;
            
            // Tratamento no onload do iframe
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    
                    isPrinting = false;
                    updateSelectedCount();
                    printBtnText.textContent = 'Imprimir';
                }, 500); // pequeno delay para garantir renderização no iframe
            };
        } catch (error) {
            alert('Erro ao gerar impressão. Veja o console para detalhes.');
            console.error(error);
            isPrinting = false;
            updateSelectedCount();
            printBtnText.textContent = 'Imprimir';
        }
    }

    // Init
    fetchFiles();
});
