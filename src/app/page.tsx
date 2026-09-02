'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import { Search } from 'lucide-react';

// Componentes Base
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Nossos Componentes Separados
import { FolderConfig } from '@/app/components/FolderConfig';
import { PdfList } from '@/app/components/PdfList';
import { PrintBar } from '@/app/components/PrintBar';

type PDFFile = { name: string; fullPath: string };

export default function Home() {
  // Estados Globais
  const [tab, setTab] = useState<'triagem' | 'tutoriais'>('triagem');
  const [customPath, setCustomPath] = useState('');
  const [currentDir, setCurrentDir] = useState('');
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [search, setSearch] = useState('');
  
  // Estados da Lista de PDFs
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [copies, setCopies] = useState<Record<string, number>>({});
  const [isPrinting, setIsPrinting] = useState(false);

  // Busca os arquivos na API
  const fetchFiles = async (currentTab = tab) => {
    try {
      const res = await axios.get('/api/pdf', {
        params: { tab: currentTab, customPath }
      });
      setFiles(res.data.files);
      setCurrentDir(res.data.currentDir);
    } catch (error) {
      console.error('Erro ao buscar arquivos', error);
    }
  };

  useEffect(() => {
    fetchFiles(tab);
    setSelected({}); // Limpa a seleção ao trocar de aba
  }, [tab]);

  // Lógica de Impressão (Mantida igual, pois é a regra de negócio central)
  const handlePrint = async () => {
    const selectedFiles = files.filter(f => selected[f.fullPath]);
    if (selectedFiles.length === 0) return alert('Selecione pelo menos um PDF.');

    setIsPrinting(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of selectedFiles) {
        const fileCopies = copies[file.fullPath] || 1;
        const res = await axios.get('/api/pdf/file', {
          params: { path: file.fullPath },
          responseType: 'arraybuffer'
        });
        
        const loadedPdf = await PDFDocument.load(res.data);
        const pageIndices = loadedPdf.getPageIndices();

        for (let i = 0; i < fileCopies; i++) {
          const copiedPages = await mergedPdf.copyPages(loadedPdf, pageIndices);
          copiedPages.forEach(p => mergedPdf.addPage(p));
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.getElementById('printFrame') as HTMLIFrameElement;
      iframe.src = blobUrl;
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setIsPrinting(false);
      };
    } catch (error) {
      alert('Erro ao gerar impressão.');
      console.error(error);
      setIsPrinting(false);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-slate-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-900">Gerenciador de Impressão</h1>

      {/* Abas */}
      <Tabs defaultValue="triagem" onValueChange={(v) => setTab(v as 'triagem' | 'tutoriais')} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="triagem" className="text-base font-semibold">📂 Triagem</TabsTrigger>
          <TabsTrigger value="tutoriais" className="text-base font-semibold">📚 Tutoriais</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Componente: Configuração de Pasta */}
      <FolderConfig 
        currentDir={currentDir} 
        customPath={customPath} 
        setCustomPath={setCustomPath} 
        onLoadPath={() => fetchFiles(tab)} 
      />

      {/* Barra de Pesquisa */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Pesquisar PDF por nome..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base shadow-sm"
        />
      </div>

      {/* Componente: Lista de Arquivos */}
      <PdfList 
        files={filteredFiles} 
        selected={selected} 
        setSelected={setSelected} 
        copies={copies} 
        setCopies={setCopies} 
      />

      {/* Componente: Barra de Impressão */}
      <PrintBar 
        selectedCount={selectedCount} 
        isPrinting={isPrinting} 
        onPrint={handlePrint} 
      />

      {/* Iframe Oculto */}
      <iframe id="printFrame" className="hidden"></iframe>
    </div>
  );
}