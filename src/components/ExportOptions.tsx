
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';

interface ExportOptionsProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  onExportPNG, 
  onExportPDF 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="toolbar-item">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onExportPNG}>Export as PNG</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
