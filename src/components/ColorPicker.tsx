import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Palette } from 'lucide-react';

const colors = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#00FF00', name: 'Green' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#FF00FF', name: 'Magenta' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#800080', name: 'Purple' },
  { hex: '#008000', name: 'Dark Green' },
];

interface ColorPickerProps {
  spectrum?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ spectrum = false }) => {
  const { state, dispatch } = useWhiteboard();
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null);

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_COLOR', payload: color });
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownHeight = 220; // Approximate height of the dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      let top = rect.bottom + window.scrollY + 80;
      if (spaceBelow < dropdownHeight) {
        // Not enough space below, show above
        top = rect.top + window.scrollY - dropdownHeight + 80;
      }
      setDropdownPos({ left: rect.left + window.scrollX - 80, top });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        type="button"
        className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
        onClick={handleButtonClick}
        style={{ backgroundColor: '#fff', color: '#222', borderColor: '#ced4da' }}
      >
        <Palette className="h-4 w-4 me-1" />
        <span className="d-none d-md-inline">Color</span>
        <span className="ms-2 rounded-circle border" style={{ width: 18, height: 18, background: state.currentColor, display: 'inline-block', border: '2px solid #eee' }}></span>
      </button>
      {isOpen && dropdownPos && ReactDOM.createPortal(
        <div
          className="dropdown-menu show p-1"
          style={{
            width: 'auto',
            background: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            border: '1px solid #e0e0e0',
            zIndex: 99999,
            position: 'fixed',
            left: dropdownPos.left,
            top: dropdownPos.top,
            padding: '6px 10px',
            minWidth: 'unset',
            margin: 0
          }}
        >
          <div className="d-flex flex-nowrap gap-2 mb-1 align-items-center justify-content-center">
            {colors.map(({ hex, name }) => (
              <button
                key={hex}
                type="button"
                className={`position-relative btn p-0 rounded-circle d-flex align-items-center justify-content-center color-swatch-btn ${
                  state.currentColor === hex ? 'border-3 border-primary shadow' : 'border-2 border-light'
                }`}
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: hex,
                  transition: 'box-shadow 0.2s',
                  boxShadow: state.currentColor === hex ? '0 0 0 3px #0d6efd33' : '0 1px 4px rgba(0,0,0,0.08)'
                }}
                onClick={() => handleColorChange(hex)}
                title={name}
                tabIndex={0}
              >
                {state.currentColor === hex && (
                  <span className="position-absolute top-0 end-0 translate-middle p-1 bg-primary rounded-circle" style={{ width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 5.5L4.5 8L8 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          {spectrum && (
            <div className="mb-2">
              <label className="form-label small text-muted">Custom Color</label>
              <input
                type="color"
                value={state.currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="form-control form-control-color w-100"
                title="Choose custom color"
              />
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

/* Add this to the bottom of the file for hover effect */
/*
.color-swatch-btn:hover {
  box-shadow: 0 0 0 3px #0d6efd33 !important;
  border-color: #0d6efd !important;
}
*/
