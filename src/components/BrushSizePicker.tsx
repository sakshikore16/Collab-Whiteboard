import React from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';

const brushSizes = [
  { size: 1, label: 'Thin' },
  { size: 3, label: 'Medium' },
  { size: 5, label: 'Thick' },
  { size: 8, label: 'Bold' },
  { size: 12, label: 'Extra Bold' }
];

export const BrushSizePicker: React.FC = () => {
  const { state, dispatch } = useWhiteboard();

  const handleSizeChange = (size: number) => {
    dispatch({ type: 'SET_BRUSH_SIZE', payload: size });
  };

  return (
    <div className="btn-group">
      {brushSizes.map(({ size, label }) => (
        <button
          key={size}
          type="button"
          className={`btn btn-outline-secondary d-flex flex-column align-items-center justify-content-center px-1 py-1 ${
            state.brushSize === size ? 'active border-primary border-2' : ''
          }`}
          onClick={() => handleSizeChange(size)}
          aria-label={`Brush size ${label}`}
          style={{ minWidth: '36px', minHeight: '36px' }}
        >
          <div 
            className="rounded-circle bg-dark mb-1" 
            style={{
              width: `${size + 6}px`,
              height: `${size + 6}px`
            }}
          />
          <small className="text-muted" style={{ fontSize: '10px' }}>{label}</small>
        </button>
      ))}
    </div>
  );
};
