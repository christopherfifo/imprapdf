import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type PDFFile = { name: string; fullPath: string };

interface PdfListProps {
  files: PDFFile[];
  selected: Record<string, boolean>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  copies: Record<string, number>;
  setCopies: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function PdfList({ files, selected, setSelected, copies, setCopies }: PdfListProps) {
  if (files.length === 0) {
    return (
      <Card className="shadow-sm border-slate-200">
        <div className="p-10 text-center text-slate-500 flex flex-col items-center">
          <FileText className="w-10 h-10 mb-2 opacity-20" />
          Nenhum PDF encontrado nesta pasta.
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <div className="overflow-y-auto max-h-[400px] p-2">
        {files.map((file) => (
          <div key={file.fullPath} className="flex justify-between items-center p-3 mb-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <Checkbox 
                id={file.fullPath}
                checked={!!selected[file.fullPath]}
                onCheckedChange={(checked) => setSelected({ ...selected, [file.fullPath]: !!checked })}
              />
              <Label htmlFor={file.fullPath} className="font-medium cursor-pointer truncate flex-1">
                {file.name}
              </Label>
            </div>
            
            <div className="flex items-center gap-3 ml-4 bg-slate-100 p-1.5 rounded-md">
              <Label htmlFor={`qty-${file.fullPath}`} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Cópias
              </Label>
              <Input 
                id={`qty-${file.fullPath}`}
                type="number" 
                min="1" 
                max="50"
                className="w-16 h-8 text-center"
                value={copies[file.fullPath] || 1}
                onChange={(e) => setCopies({ ...copies, [file.fullPath]: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}