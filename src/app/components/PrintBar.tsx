import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintBarProps {
  selectedCount: number;
  isPrinting: boolean;
  onPrint: () => void;
}

export function PrintBar({ selectedCount, isPrinting, onPrint }: PrintBarProps) {
  return (
    <div className="sticky bottom-6 mt-8 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl flex justify-between items-center z-10">
      <span className="font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
        {selectedCount} arquivo(s) selecionado(s)
      </span>
      <Button 
        onClick={onPrint} 
        disabled={isPrinting || selectedCount === 0}
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold px-8"
      >
        {isPrinting ? 'Gerando Documento...' : (
          <>
            <Printer className="w-5 h-5 mr-2" />
            Imprimir Selecionados
          </>
        )}
      </Button>
    </div>
  );
}