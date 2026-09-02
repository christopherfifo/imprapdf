import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FolderConfigProps {
  currentDir: string;
  customPath: string;
  setCustomPath: (path: string) => void;
  onLoadPath: () => void;
}

export function FolderConfig({ currentDir, customPath, setCustomPath, onLoadPath }: FolderConfigProps) {
  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Folder className="w-5 h-5 text-slate-500" />
          Caminho da Pasta Atual
        </CardTitle>
        <CardDescription className="text-sm font-mono bg-slate-100 p-2 rounded-md break-all">
          {currentDir || 'Carregando...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Input 
          placeholder="Opcional: Cole um caminho do seu PC (Ex: C:\Meus PDFs)" 
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onLoadPath} variant="secondary">
          Carregar Caminho
        </Button>
      </CardContent>
    </Card>
  );
}