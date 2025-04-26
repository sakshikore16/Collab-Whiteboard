export type Point = {
  x: number;
  y: number;
};

export type DrawingMode = 'brush' | 'eraser';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'text';

export type Shape = {
  type: ShapeType;
  start: Point;
  end: Point;
  text?: string; // For text boxes
};

export type DrawingAction = {
  id: string;
  tool: DrawingMode;
  points?: Point[];
  shape?: Shape;
  type?: 'path' | 'shape';
  color: string;
  width: number;
  timestamp: number;
  brushType: string;
};

export type CursorPosition = {
  userId: string;
  point: Point;
  color: string;
  username: string;
};

export type WhiteboardState = {
  sessionId: string | null;
  username: string;
  userId: string;
  actions: DrawingAction[];
  redoStack: DrawingAction[];
  currentColor: string;
  brushSize: number;
  drawingMode: DrawingMode;
  cursors: Map<string, CursorPosition>;
  isDrawing: boolean;
  brushType: string;
  activeShape: ShapeType | null;
  currentText: string;
};

export type DrawingOptions = {
  color: string;
  width: number;
  mode: DrawingMode;
  brushType?: string;
};

export type BrushType = 'brush' | 'pencil' | 'pen';
