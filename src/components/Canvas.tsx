import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, PencilBrush, Rect, Circle, Line, Textbox, FabricObject, Polygon, Path } from 'fabric';
import { useWhiteboard } from '../context/WhiteboardContext';

interface CanvasProps {
  width: number;
  height: number;
}

export const CanvasComponent = forwardRef<HTMLCanvasElement & { getFabricCanvas?: () => Canvas | null }, CanvasProps>(({ width, height }, ref) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const { state, addDrawingAction } = useWhiteboard();
  const lastSize = useRef({ width, height });

  useImperativeHandle(ref, () => {
    const htmlCanvas = (fabricRef.current?.getElement() as HTMLCanvasElement) || null;
    if (!htmlCanvas) return null as any;
    (htmlCanvas as any).getFabricCanvas = () => fabricRef.current;
    return htmlCanvas as HTMLCanvasElement & { getFabricCanvas?: () => Canvas | null };
  });

  // Only create the canvas on mount or size change
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    canvasContainerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = width;
    canvasEl.height = height;
    canvasContainerRef.current.appendChild(canvasEl);
    const fabricCanvas = new Canvas(canvasEl, {
      backgroundColor: 'white',
      isDrawingMode: true,
    });
    fabricRef.current = fabricCanvas;
    lastSize.current = { width, height };
    // Attach shape/text/fill/eraser handlers
    attachCustomHandlers(fabricCanvas);
    return () => {
      fabricCanvas.dispose();
    };
  }, [width, height]);

  // Update brush/tool on state change (but not canvas recreation)
  useEffect(() => {
    if (!fabricRef.current) return;
    setupBrush(fabricRef.current);
  }, [state.drawingMode, state.brushType, state.currentColor, state.brushSize, state.activeShape]);

  // Helper to set up the correct brush/tool
  const setupBrush = (fabricCanvas: Canvas) => {
    if (state.drawingMode === 'eraser') {
      // Eraser: disable drawing mode, enable eraser logic
      fabricCanvas.isDrawingMode = false;
      return;
    }
    if (state.activeShape) {
      // Shape mode: disable free drawing
      fabricCanvas.isDrawingMode = false;
      return;
    }
    // Brush mode
    if (state.brushType === 'highlighter') {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = state.currentColor + '80'; // add alpha for transparency
      brush.width = state.brushSize * 2;
      fabricCanvas.freeDrawingBrush = brush;
      fabricCanvas.isDrawingMode = true;
    } else {
      // Default: pen/pencil
      const brush = new PencilBrush(fabricCanvas);
      brush.color = state.currentColor;
      brush.width = state.brushSize;
      fabricCanvas.freeDrawingBrush = brush;
      fabricCanvas.isDrawingMode = true;
    }
  };

  // Freehand drawing: listen to Fabric's path:created event
  useEffect(() => {
    if (!fabricRef.current) return;
    const fabricCanvas = fabricRef.current;
    const handlePathCreated = (e: any) => {
      const path = e.path;
      if (!path) return;
      // Convert path points to array of {x, y}
      const points = [];
      if (path.path) {
        for (const seg of path.path) {
          if (seg.length >= 3) {
            points.push({ x: seg[1], y: seg[2] });
          }
        }
      }
      addDrawingAction({
        tool: 'brush',
        points,
        color: path.stroke,
        width: path.strokeWidth,
        brushType: state.brushType,
      });
    };
    fabricCanvas.on('path:created', handlePathCreated);
    return () => {
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [addDrawingAction, state.brushType]);

  // Attach custom handlers for fill, eraser, and shapes
  const attachCustomHandlers = (fabricCanvas: Canvas) => {
    // Remove previous listeners
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');

    // State for shape drawing
    let isDrawingShape = false;
    let shapeObj: any = null;
    let startX = 0;
    let startY = 0;

    // State for fill click
    let fillStart: { x: number; y: number } | null = null;

    // State for eraser
    let isErasing = false;

    // Fill tool: fill on true click (mouse down and up at same spot)
    const handleFillDown = (opt: any) => {
      if (state.brushType === 'fill') {
        const pointer = fabricCanvas.getPointer(opt.e);
        fillStart = { x: pointer.x, y: pointer.y };
      }
    };
    const handleFillUp = (opt: any) => {
      if (state.brushType === 'fill' && fillStart) {
        const pointer = fabricCanvas.getPointer(opt.e);
        const dx = pointer.x - fillStart.x;
        const dy = pointer.y - fillStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) { // treat as click if mouse didn't move much
          fabricCanvas.set('backgroundColor', state.currentColor);
          fabricCanvas.renderAll();
          addDrawingAction({
            tool: 'brush',
            points: [],
            color: state.currentColor,
            width: state.brushSize,
            brushType: 'fill',
          });
        }
        fillStart = null;
      }
    };

    // Eraser: only erase when mouse is pressed
    const handleEraserDown = (opt: any) => {
      if (state.drawingMode === 'eraser') {
        isErasing = true;
        eraseAtPointer(opt);
      }
    };
    const handleEraserMove = (opt: any) => {
      if (state.drawingMode === 'eraser' && isErasing) {
        eraseAtPointer(opt);
      }
    };
    const handleEraserUp = () => {
      if (state.drawingMode === 'eraser') {
        isErasing = false;
      }
    };
    const eraseAtPointer = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      const objects = fabricCanvas.getObjects();
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i] as FabricObject;
        if (obj.containsPoint && obj.containsPoint(pointer)) {
          fabricCanvas.remove(obj);
          fabricCanvas.renderAll();
          break;
        }
      }
    };

    // Shape/text tool logic
    const mouseDown = (opt: any) => {
      if (state.brushType === 'fill') {
        handleFillDown(opt);
        return;
      }
      if (state.drawingMode === 'eraser') {
        handleEraserDown(opt);
        return;
      }
      if (!state.activeShape) return;
      isDrawingShape = true;
      const pointer = fabricCanvas.getPointer(opt.e);
      startX = pointer.x;
      startY = pointer.y;
      if (state.activeShape === 'rectangle') {
        shapeObj = new Rect({
          left: startX,
          top: startY,
          width: 1,
          height: 1,
          fill: state.currentColor + '33',
          stroke: state.currentColor,
          strokeWidth: state.brushSize,
        });
      } else if (state.activeShape === 'circle') {
        shapeObj = new Circle({
          left: startX,
          top: startY,
          radius: 1,
          fill: state.currentColor + '33',
          stroke: state.currentColor,
          strokeWidth: state.brushSize,
        });
      } else if (state.activeShape === 'arrow') {
        shapeObj = new Line([startX, startY, startX, startY], {
          stroke: state.currentColor,
          strokeWidth: state.brushSize,
          selectable: false,
        });
      } else if (state.activeShape === 'text') {
        shapeObj = new Textbox('Text', {
          left: startX,
          top: startY,
          fontSize: 20 + state.brushSize * 2,
          fill: state.currentColor,
        });
        fabricCanvas.add(shapeObj);
        isDrawingShape = false;
        shapeObj = null;
        return;
      }
      if (shapeObj) fabricCanvas.add(shapeObj);
    };

    const mouseMove = (opt: any) => {
      if (state.drawingMode === 'eraser') {
        handleEraserMove(opt);
        return;
      }
      if (!isDrawingShape || !shapeObj) return;
      const pointer = fabricCanvas.getPointer(opt.e);
      if (state.activeShape === 'rectangle') {
        shapeObj.set({
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
          left: Math.min(pointer.x, startX),
          top: Math.min(pointer.y, startY),
        });
      } else if (state.activeShape === 'circle') {
        const radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2;
        shapeObj.set({
          radius,
          left: (pointer.x + startX) / 2 - radius,
          top: (pointer.y + startY) / 2 - radius,
        });
      } else if (state.activeShape === 'arrow') {
        shapeObj.set({ x2: pointer.x, y2: pointer.y });
      }
      fabricCanvas.renderAll();
    };

    const mouseUp = (opt: any) => {
      if (state.brushType === 'fill') {
        handleFillUp(opt);
        return;
      }
      if (state.drawingMode === 'eraser') {
        handleEraserUp();
        return;
      }
      if (state.activeShape && shapeObj) {
        // Save shape to actions for undo/redo
        const pointer = fabricCanvas.getPointer(opt.e);
        const end = { x: pointer.x, y: pointer.y };
        const start = { x: startX, y: startY };
        let shapeType = state.activeShape;
        let text = undefined;
        if (shapeType === 'text' && shapeObj && shapeObj.text) {
          text = shapeObj.text;
        }
        const shapeAction = {
          tool: 'brush' as import('../types/whiteboard').DrawingMode,
          type: 'shape' as const,
          shape: { type: shapeType, start, end, text },
          color: state.currentColor,
          width: state.brushSize,
          brushType: state.brushType,
        };
        console.log('Dispatching shape action:', shapeAction);
        addDrawingAction(shapeAction);
        // Remove the temporary shape object after dispatching
        fabricCanvas.remove(shapeObj);
      }
      if (state.activeShape === 'arrow' && shapeObj) {
        // Add arrowhead at the end of the line
        const pointer = fabricCanvas.getPointer(opt.e);
        const x1 = startX;
        const y1 = startY;
        const x2 = pointer.x;
        const y2 = pointer.y;
        // Calculate angle
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 20 + state.brushSize * 2;
        const arrowWidth = 10 + state.brushSize;
        // Points for triangle
        const tipX = x2;
        const tipY = y2;
        const leftX = tipX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle) / 2;
        const leftY = tipY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle) / 2;
        const rightX = tipX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle) / 2;
        const rightY = tipY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle) / 2;
        const arrowHead = new Polygon([
          { x: tipX, y: tipY },
          { x: leftX, y: leftY },
          { x: rightX, y: rightY }
        ], {
          fill: state.currentColor,
          selectable: false,
          evented: false
        });
        fabricCanvas.add(arrowHead);
      }
      isDrawingShape = false;
      shapeObj = null;
    };

    fabricCanvas.on('mouse:down', mouseDown);
    fabricCanvas.on('mouse:move', mouseMove);
    fabricCanvas.on('mouse:up', mouseUp);
  };

  // Re-attach handlers when tool/shape/eraser/fill changes
  useEffect(() => {
    if (fabricRef.current) {
      attachCustomHandlers(fabricRef.current);
    }
  }, [state.drawingMode, state.brushType, state.activeShape, state.currentColor, state.brushSize]);

  // Replay all actions on the Fabric canvas
  const replayActions = () => {
    if (!fabricRef.current) return;
    const fabricCanvas = fabricRef.current;
    fabricCanvas.clear();
    // Set background color if there was a fill action
    const lastFill = state.actions.filter(a => a.brushType === 'fill').pop();
    if (lastFill) {
      fabricCanvas.set('backgroundColor', lastFill.color);
    } else {
      fabricCanvas.set('backgroundColor', 'white');
    }
    // Replay all actions
    for (const action of state.actions) {
      if (action.brushType === 'fill') {
        // Already handled above
        continue;
      }
      if (action.tool === 'brush' && (!action.brushType || action.brushType === 'pencil' || action.brushType === 'highlighter')) {
        // Draw freehand path
        if (action.points && action.points.length > 1) {
          const pathData = action.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
          const path = new Path(pathData, {
            stroke: action.color,
            strokeWidth: action.width,
            fill: '',
            opacity: action.brushType === 'highlighter' ? 0.4 : 1,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(path);
        }
      } else if (action.type === 'shape' && action.shape) {
        console.log('Replaying shape action:', action);
        // Draw shape
        const { type, start, end, text } = action.shape;
        if (type === 'rectangle') {
          const rect = new Rect({
            left: Math.min(start.x, end.x),
            top: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
            fill: action.color + '33',
            stroke: action.color,
            strokeWidth: action.width,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(rect);
        } else if (type === 'circle') {
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
          const circle = new Circle({
            left: (start.x + end.x) / 2 - radius,
            top: (start.y + end.y) / 2 - radius,
            radius,
            fill: action.color + '33',
            stroke: action.color,
            strokeWidth: action.width,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(circle);
        } else if (type === 'arrow') {
          const line = new Line([start.x, start.y, end.x, end.y], {
            stroke: action.color,
            strokeWidth: action.width,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(line);
          // Add arrowhead
          const angle = Math.atan2(end.y - start.x, end.x - start.x);
          const arrowLength = 20 + action.width * 2;
          const arrowWidth = 10 + action.width;
          const tipX = end.x;
          const tipY = end.y;
          const leftX = tipX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle) / 2;
          const leftY = tipY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle) / 2;
          const rightX = tipX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle) / 2;
          const rightY = tipY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle) / 2;
          const arrowHead = new Polygon([
            { x: tipX, y: tipY },
            { x: leftX, y: leftY },
            { x: rightX, y: rightY }
          ], {
            fill: action.color,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(arrowHead);
        } else if (type === 'text' && text) {
          const textbox = new Textbox(text, {
            left: start.x,
            top: start.y,
            fontSize: 20 + action.width * 2,
            fill: action.color,
            selectable: false,
            evented: false
          });
          fabricCanvas.add(textbox);
        }
      }
    }
    fabricCanvas.renderAll();
  };

  // Listen to state.actions and replay on change
  useEffect(() => {
    replayActions();
  }, [state.actions]);

  return (
    <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
  );
});

CanvasComponent.displayName = 'CanvasComponent';
