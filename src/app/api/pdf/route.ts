import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'triagem'; // 'triagem' ou 'tutoriais'
  const customPath = searchParams.get('customPath');

  // Define a pasta padrão dentro do projeto: raiz_do_projeto/pdfs/triagem
  let targetDir = path.join(process.cwd(), 'pdfs', tab);

  // Se o usuário digitou um caminho personalizado e ele existe, usa ele
  if (customPath && fs.existsSync(customPath)) {
    targetDir = customPath;
  }

  try {
    // Se a pasta padrão não existir, o Node cria automaticamente
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Lê os arquivos da pasta
    const files = fs.readdirSync(targetDir)
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file,
        fullPath: path.join(targetDir, file) // Guarda o caminho absoluto para o download
      }));

    return NextResponse.json({ files, currentDir: targetDir });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao ler a pasta' }, { status: 500 });
  }
}