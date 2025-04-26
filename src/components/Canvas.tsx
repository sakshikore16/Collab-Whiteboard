import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { drawLine, drawPath, drawShape } from '../utils/drawingUtils';
import { Point, Shape } from '../types/whiteboard';
import { toast } from '@/components/ui/sonner';

interface CanvasProps {
  width: number;
  height: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<HTMLInputElement | null>(null);
  const { state, dispatch, addDrawingAction, updateCursorPosition } = useWhiteboard();
  
  const lastPointRef = useRef<Point | null>(null);

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    state.actions.forEach(action => {
      if (action.brushType === 'fill') {
        ctx.fillStyle = action.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      if (action.type === 'shape') {
        drawShape(ctx, action.shape, {
          color: action.color,
          width: action.width,
          mode: action.tool,
          brushType: action.brushType
        });
        return;
      }
      
      if (action.points?.length < 2) return;
      
      drawPath(ctx, action.points, {
        color: action.color,
        width: action.width,
        mode: action.tool,
        brushType: action.brushType
      });
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    canvas.width = width;
    canvas.height = height;
    
    redrawCanvas();
  }, [width, height]);

  useEffect(() => {
    redrawCanvas();
  }, [state.actions]);

  useEffect(() => {
    if (!shapeStart || !state.activeShape || !state.isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();
    
    const shape: Shape = {
      type: state.activeShape,
      start: shapeStart,
      end: lastPointRef.current || shapeStart,
    };
    
    drawShape(ctx, shape, {
      color: state.currentColor,
      width: state.brushSize,
      mode: 'brush',
      brushType: 'shape'
    });
  }, [lastPointRef.current, shapeStart, state.activeShape, state.isDrawing]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.sessionId) {
      toast.error('Please join a session to start drawing');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.setPointerCapture(e.pointerId);
    
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (state.activeShape === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'absolute z-10 p-1 border border-gray-300 rounded';
      input.style.width = '120px';
      input.style.height = '28px';
      input.style.fontSize = '16px';
      input.style.color = state.currentColor;
      input.style.background = '#fff';
      input.style.border = '1px solid #bdbdbd';
      input.style.padding = '2px 6px';
      input.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      const containerRect = canvas.parentElement?.getBoundingClientRect();
      if (containerRect) {
        input.style.left = `${e.clientX - containerRect.left}px`;
        input.style.top = `${e.clientY - containerRect.top}px`;
      } else {
        input.style.left = `${e.clientX}px`;
        input.style.top = `${e.clientY}px`;
      }
      
      input.onkeydown = (event) => {
        if (event.key === 'Enter') {
          const text = input.value;
          if (text) {
            addDrawingAction({
              tool: 'brush',
              type: 'shape',
              shape: {
                type: 'text',
                start: point,
                end: point,
                text
              },
              color: state.currentColor,
              width: state.brushSize,
              brushType: 'shape'
            });
          }
          input.remove();
          setTextInput(null);
        }
      };
      
      canvas.parentElement?.appendChild(input);
      input.focus();
      setTextInput(input);
      return;
    }
    
    if (state.activeShape) {
      setShapeStart(point);
      lastPointRef.current = point;
    } else {
      setCurrentPath([point]);
      lastPointRef.current = point;
    }
    
    dispatch({ type: 'SET_IS_DRAWING', payload: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    updateCursorPosition(point);
    
    if (!state.isDrawing || !state.sessionId) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (state.activeShape) {
      lastPointRef.current = point;
      return;
    }
    
    if (lastPointRef.current) {
      drawLine(ctx, lastPointRef.current, point, {
        color: state.currentColor,
        width: state.brushSize,
        mode: state.drawingMode,
        brushType: state.brushType
      });
    }
    
    setCurrentPath(prev => [...prev, point]);
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    if (!state.isDrawing || !state.sessionId) return;
    
    if (state.activeShape && shapeStart && lastPointRef.current) {
      addDrawingAction({
        tool: 'brush',
        type: 'shape',
        shape: {
          type: state.activeShape,
          start: shapeStart,
          end: lastPointRef.current
        },
        color: state.currentColor,
        width: state.brushSize,
        brushType: 'shape'
      });
      setShapeStart(null);
    } else if (currentPath.length > 0) {
      addDrawingAction({
        tool: state.drawingMode,
        points: currentPath,
        color: state.currentColor,
        width: state.brushSize,
        brushType: state.brushType
      });
    }
    
    setCurrentPath([]);
    lastPointRef.current = null;
    dispatch({ type: 'SET_IS_DRAWING', payload: false });
  };

  const handlePointerLeave = () => {
    handlePointerUp();
  };

  useEffect(() => {
    return () => {
      if (textInput) {
        textInput.remove();
      }
    };
  }, [textInput]);

  return (
    <div className="whiteboard-container relative">
      {!state.sessionId && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Join a Session</h3>
            <p className="text-sm text-muted-foreground">Please join a session to start drawing</p>
          </div>
        </div>
      )}
      
      {Array.from(state.cursors).map(([userId, cursor]) => {
        if (userId === state.userId) return null;
        
        return (
          <div 
            key={userId}
            className="cursor-position absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: cursor.point.x,
              top: cursor.point.y,
              backgroundColor: cursor.color
            }}
          >
            <span 
              className="absolute -top-5 left-2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap"
              style={{ fontSize: '8px' }}
            >
              {cursor.username}
            </span>
          </div>
        );
      })}
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';
