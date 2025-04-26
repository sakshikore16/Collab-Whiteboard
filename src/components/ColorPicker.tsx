
import React, { useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

const colors = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
];

interface ColorPickerProps {
  spectrum?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ spectrum = false }) => {
  const { state, dispatch } = useWhiteboard();
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_COLOR', payload: color });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 relative"
          style={{ 
            backgroundColor: state.currentColor,
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgb(0 0 0 / 0.1)'
          }}
        >
          <Palette className="h-4 w-4 absolute opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full cursor-pointer ${
                state.currentColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
        {spectrum && (
          <input
            type="color"
            value={state.currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-8 cursor-pointer"
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
