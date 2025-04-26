import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Button } from '@/components/ui/button';
import { Highlighter, Pencil, PaintBucket } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const brushTypes = [
  { id: 'pencil', icon: Pencil, label: 'Pen', description: 'Sharp, precise lines' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', description: 'Wide, semi-transparent strokes' },
  { id: 'fill', icon: PaintBucket, label: 'Fill', description: 'Fill entire canvas with selected color' }
] as const;

export const BrushTypesPicker = () => {
  const { state, dispatch } = useWhiteboard();

  const handleBrushTypeChange = (brushType: string) => {
    if (brushType === 'fill') {
      dispatch({ type: 'SET_DRAWING_MODE', payload: 'brush' });
      dispatch({ type: 'SET_BRUSH_TYPE', payload: 'fill' });
      // Clear active shape if one is selected
      if (state.activeShape) {
        dispatch({ type: 'SET_ACTIVE_SHAPE', payload: null });
      }
      return;
    }
    // Set brush mode (not eraser) when changing brush type
    dispatch({ type: 'SET_DRAWING_MODE', payload: 'brush' });
    dispatch({ type: 'SET_BRUSH_TYPE', payload: brushType });
    // Clear active shape if one is selected
    if (state.activeShape) {
      dispatch({ type: 'SET_ACTIVE_SHAPE', payload: null });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {brushTypes.map(({ id, icon: Icon, label, description }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Button
              variant={(state.brushType === id && state.drawingMode === 'brush' && !state.activeShape) ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleBrushTypeChange(id)}
              className={`w-8 h-8${state.brushType === id && state.drawingMode === 'brush' && !state.activeShape ? ' active' : ''}`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}: {description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
