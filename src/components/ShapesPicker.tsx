import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Square, Circle, ArrowRight, Text } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const shapes = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'text', icon: Text, label: 'Text Box' },
] as const;

export const ShapesPicker = () => {
  const { state, dispatch } = useWhiteboard();

  const handleShapeSelect = (shapeType: string | null) => {
    if (!shapeType) {
      dispatch({ type: 'SET_ACTIVE_SHAPE', payload: null });
      return;
    }
    
    dispatch({ type: 'SET_DRAWING_MODE', payload: 'brush' });
    dispatch({ type: 'SET_ACTIVE_SHAPE', payload: shapeType as any });
  };

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup type="single" value={state.activeShape ? String(state.activeShape) : ''} onValueChange={handleShapeSelect}>
        {shapes.map(({ id, icon: Icon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value={id} 
                aria-label={`Insert ${label}`}
                className={state.activeShape === id ? 'border border-primary border-2 bg-primary bg-opacity-10' : ''}
                style={state.activeShape === id ? { boxShadow: '0 0 0 2px #0d6efd33' } : {}}
              >
                <Icon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert {label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  );
};
