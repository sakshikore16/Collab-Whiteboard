
import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { ColorPicker } from './ColorPicker';
import { BrushSizePicker } from './BrushSizePicker';
import { BrushTypesPicker } from './BrushTypesPicker';
import { ShapesPicker } from './ShapesPicker';
import { ExportOptions } from './ExportOptions';
import { Button } from '@/components/ui/button';
import { Eraser, Undo, Redo } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ToolbarProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onClearCanvas: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onExportPNG, 
  onExportPDF, 
  onClearCanvas 
}) => {
  const { state, dispatch } = useWhiteboard();

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  const handleToolChange = (mode: 'brush' | 'eraser') => {
    dispatch({ type: 'SET_DRAWING_MODE', payload: mode });
    
    // Ensure we're in drawing mode, not shape insertion mode
    if (state.activeShape) {
      dispatch({ type: 'SET_ACTIVE_SHAPE', payload: null });
    }
  };

  return (
    <div className="toolbar flex items-center gap-2 p-2 bg-white rounded-lg shadow-lg">
      <BrushTypesPicker />
      <Separator orientation="vertical" className="h-6" />
      
      <Button
        variant={state.drawingMode === 'eraser' && !state.activeShape ? 'default' : 'outline'}
        size="icon"
        className="toolbar-item"
        onClick={() => handleToolChange('eraser')}
      >
        <Eraser className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <ShapesPicker />
      
      <Separator orientation="vertical" className="h-6" />
      
      <BrushSizePicker />
      
      <Separator orientation="vertical" className="h-6" />
      
      <ColorPicker spectrum />
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="toolbar-item"
          onClick={handleUndo}
          disabled={state.actions.length === 0}
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="toolbar-item"
          onClick={handleRedo}
          disabled={state.redoStack.length === 0}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />
      
      <ExportOptions 
        onExportPNG={onExportPNG} 
        onExportPDF={onExportPDF} 
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        className="toolbar-item" 
        onClick={onClearCanvas}
      >
        Clear
      </Button>
    </div>
  );
};
