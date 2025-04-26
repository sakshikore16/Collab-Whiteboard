
import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';

const brushSizes = [1, 3, 5, 8, 12];

export const BrushSizePicker: React.FC = () => {
  const { state, dispatch } = useWhiteboard();

  const handleSizeChange = (size: number) => {
    dispatch({ type: 'SET_BRUSH_SIZE', payload: size });
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-white rounded-md shadow-md">
      {brushSizes.map((size) => (
        <button
          key={size}
          className={`p-1 rounded-full toolbar-item flex items-center justify-center ${
            state.brushSize === size ? 'bg-gray-200' : ''
          }`}
          onClick={() => handleSizeChange(size)}
          aria-label={`Brush size ${size}`}
        >
          <span 
            className="block rounded-full bg-black" 
            style={{
              width: `${size * 2}px`,
              height: `${size * 2}px`
            }}
          />
        </button>
      ))}
    </div>
  );
};
