import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse('Arquivo não encontrado', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
}