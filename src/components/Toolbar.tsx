import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { ColorPicker } from './ColorPicker';
import { BrushSizePicker } from './BrushSizePicker';
import { BrushTypesPicker } from './BrushTypesPicker';
import { ShapesPicker } from './ShapesPicker';
import { ExportOptions } from './ExportOptions';
import { Eraser, Undo, Redo } from 'lucide-react';

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
    <div className="d-flex align-items-center gap-2 bg-white border rounded shadow-sm px-3 py-2 w-100" style={{ minHeight: '48px' }}>
      <div className="btn-group">
        <BrushTypesPicker />
      </div>
      
      <div className="vr mx-2"></div>
      
      <button
        type="button"
        className={`btn ${state.drawingMode === 'eraser' && !state.activeShape ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handleToolChange('eraser')}
      >
        <Eraser className="h-4 w-4" />
      </button>
      
      <div className="vr mx-2"></div>
      
      <div className="btn-group">
        <ShapesPicker />
      </div>
      
      <div className="vr mx-2"></div>
      
      <div className="btn-group">
        <BrushSizePicker />
      </div>
      
      <div className="vr mx-2"></div>
      
      <div className="btn-group">
        <ColorPicker spectrum />
      </div>
      
      <div className="vr mx-2"></div>
      
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleUndo}
          disabled={state.actions.length === 0}
        >
          <Undo className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleRedo}
          disabled={state.redoStack.length === 0}
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div className="vr mx-2"></div>
      
      <div className="btn-group">
        <ExportOptions 
          onExportPNG={onExportPNG} 
          onExportPDF={onExportPDF} 
        />
      </div>
      
      <button 
        type="button"
        className="btn btn-outline-danger" 
        onClick={onClearCanvas}
      >
        Clear
      </button>
    </div>
  );
};
