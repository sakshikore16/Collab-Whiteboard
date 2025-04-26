import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  WhiteboardState, 
  DrawingAction, 
  DrawingMode, 
  Point,
  CursorPosition,
  Shape,
  ShapeType
} from '../types/whiteboard';
import { generateSessionId, generateUserId } from '../utils/drawingUtils';
import { toast } from '@/components/ui/sonner';

type WhiteboardAction = 
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'ADD_DRAWING_ACTION'; payload: DrawingAction }
  | { type: 'SET_DRAWING_MODE'; payload: DrawingMode }
  | { type: 'SET_COLOR'; payload: string }
  | { type: 'SET_BRUSH_SIZE'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_CURSOR'; payload: { userId: string; point: Point; username: string } }
  | { type: 'SET_IS_DRAWING'; payload: boolean }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'SET_BRUSH_TYPE'; payload: string }
  | { type: 'SET_ACTIVE_SHAPE'; payload: ShapeType | null }
  | { type: 'SET_CURRENT_TEXT'; payload: string }
  | { type: 'FILL_CANVAS'; payload: string };

const initialState: WhiteboardState = {
  sessionId: null,
  username: localStorage.getItem('username') || `User-${Math.floor(Math.random() * 1000)}`,
  userId: generateUserId(),
  actions: [],
  redoStack: [],
  currentColor: localStorage.getItem('currentColor') || '#000000',
  brushSize: Number(localStorage.getItem('brushSize')) || 3,
  drawingMode: localStorage.getItem('drawingMode') as DrawingMode || 'brush',
  cursors: new Map(),
  isDrawing: false,
  brushType: localStorage.getItem('brushType') || 'pencil',
  activeShape: null,
  currentText: '',
};

const WhiteboardContext = createContext<{
  state: WhiteboardState;
  dispatch: React.Dispatch<WhiteboardAction>;
  createSession: (username?: string) => void;
  joinSession: (sessionId: string, username?: string) => void;
  addDrawingAction: (action: Omit<DrawingAction, 'id' | 'timestamp'>) => void;
  updateCursorPosition: (point: Point) => void;
}>({
  state: initialState,
  dispatch: () => null,
  createSession: () => {},
  joinSession: () => {},
  addDrawingAction: () => {},
  updateCursorPosition: () => {},
});

const whiteboardReducer = (state: WhiteboardState, action: WhiteboardAction): WhiteboardState => {
  switch (action.type) {
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'ADD_DRAWING_ACTION':
      return { 
        ...state, 
        actions: [...state.actions, action.payload],
        redoStack: [] // Clear redo stack when a new action is added
      };
    case 'SET_DRAWING_MODE':
      return { ...state, drawingMode: action.payload };
    case 'SET_COLOR':
      return { ...state, currentColor: action.payload };
    case 'SET_BRUSH_SIZE':
      return { ...state, brushSize: action.payload };
    case 'SET_ACTIVE_SHAPE':
      return { ...state, activeShape: action.payload };
    case 'UNDO':
      if (state.actions.length === 0) return state;
      const lastAction = state.actions[state.actions.length - 1];
      return {
        ...state,
        actions: state.actions.slice(0, -1),
        redoStack: [...state.redoStack, lastAction]
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const actionToRedo = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        actions: [...state.actions, actionToRedo],
        redoStack: state.redoStack.slice(0, -1)
      };
    case 'UPDATE_CURSOR': {
      const newCursors = new Map(state.cursors);
      const existingCursor = newCursors.get(action.payload.userId);
      
      if (existingCursor) {
        newCursors.set(action.payload.userId, {
          ...existingCursor,
          point: action.payload.point,
          username: action.payload.username || existingCursor.username
        });
      } else {
        newCursors.set(action.payload.userId, {
          userId: action.payload.userId,
          point: action.payload.point,
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
          username: action.payload.username || `User-${Math.floor(Math.random() * 1000)}`
        });
      }
      
      return { ...state, cursors: newCursors };
    }
    case 'SET_IS_DRAWING':
      return { ...state, isDrawing: action.payload };
    case 'CLEAR_CANVAS':
      return { ...state, actions: [], redoStack: [] };
    case 'SET_BRUSH_TYPE':
      // When changing brush type, clear active shape
      return { ...state, brushType: action.payload, activeShape: null };
    case 'FILL_CANVAS': {
      const fillAction: DrawingAction = {
        id: generateUserId(),
        tool: 'brush',
        points: [], // Empty points array indicates fill action
        color: action.payload,
        width: state.brushSize,
        timestamp: Date.now(),
        brushType: 'fill'
      };
      return {
        ...state,
        actions: [...state.actions, fillAction],
        redoStack: []
      };
    }
    case 'SET_CURRENT_TEXT':
      return { ...state, currentText: action.payload };
    default:
      return state;
  }
};

export const WhiteboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(whiteboardReducer, initialState);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('username', state.username);
    localStorage.setItem('currentColor', state.currentColor);
    localStorage.setItem('brushSize', state.brushSize.toString());
    localStorage.setItem('drawingMode', state.drawingMode);
    localStorage.setItem('brushType', state.brushType);
  }, [state.username, state.currentColor, state.brushSize, state.drawingMode, state.brushType]);

  const createSession = (username?: string) => {
    const sessionId = generateSessionId();
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    
    if (username) {
      dispatch({ type: 'SET_USERNAME', payload: username });
    }
    
    toast.success(`Created session: ${sessionId}`);
  };

  const joinSession = (sessionId: string, username?: string) => {
    if (!sessionId.trim()) {
      toast.error('Please enter a valid session ID');
      return;
    }
    
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    
    if (username) {
      dispatch({ type: 'SET_USERNAME', payload: username });
    }
    
    toast.success(`Joined session: ${sessionId}`);
  };

  const addDrawingAction = (action: Omit<DrawingAction, 'id' | 'timestamp'>) => {
    const completeAction: DrawingAction = {
      ...action,
      id: generateUserId(),
      timestamp: Date.now()
    };
    dispatch({ type: 'ADD_DRAWING_ACTION', payload: completeAction });
  };

  const updateCursorPosition = (point: Point) => {
    dispatch({
      type: 'UPDATE_CURSOR',
      payload: { userId: state.userId, point, username: state.username }
    });
  };

  return (
    <WhiteboardContext.Provider
      value={{
        state,
        dispatch,
        createSession,
        joinSession,
        addDrawingAction,
        updateCursorPosition
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => useContext(WhiteboardContext);
