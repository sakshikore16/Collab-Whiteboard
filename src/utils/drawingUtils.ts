import { Point, DrawingOptions, Shape } from "../types/whiteboard";
import type { Canvas as FabricCanvas } from 'fabric';

export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const generateUserId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  options: DrawingOptions
): void => {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  
  ctx.strokeStyle = options.mode === 'eraser' ? '#FFFFFF' : options.color;
  ctx.lineWidth = options.width;
  
  switch (options.brushType) {
    case 'highlighter':
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = options.width * 2;
      ctx.shadowBlur = 0;
      break;
      
    case 'pencil':
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1, options.width * 0.7);
      ctx.shadowBlur = 0;
      break;

    case 'fill':
      ctx.fillStyle = options.color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      break;
  }
  
  if (options.brushType !== 'fill') {
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options: DrawingOptions
): void => {
  if (options.brushType === 'fill') {
    ctx.fillStyle = options.color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  ctx.strokeStyle = options.mode === 'eraser' ? '#FFFFFF' : options.color;
  ctx.lineWidth = options.width;
  
  switch (options.brushType) {
    case 'highlighter':
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = options.width * 2;
      ctx.shadowBlur = 0;
      break;
      
    case 'pencil':
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1, options.width * 0.7);
      ctx.shadowBlur = 0;
      break;
  }

  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  
  if (points.length > 2) {
    const last = points.length - 1;
    ctx.quadraticCurveTo(
      points[last - 1].x,
      points[last - 1].y,
      points[last].x,
      points[last].y
    );
  }
  
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  options: DrawingOptions
): void => {
  const { start, end, type, text } = shape;
  
  // Calculate width and height
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  // Calculate top-left coordinates
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  
  ctx.beginPath();
  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.width;
  ctx.fillStyle = options.color + '33'; // Add 20% opacity
  
  switch (type) {
    case 'rectangle':
      ctx.rect(x, y, width, height);
      ctx.fill();
      ctx.stroke();
      break;
      
    case 'circle':
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radius = Math.max(width, height) / 2;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'arrow':
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = 15;
      
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 6),
        end.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 6),
        end.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      break;

    case 'text':
      if (text) {
        ctx.font = `${options.width * 8}px sans-serif`;
        ctx.fillStyle = options.color;
        ctx.fillText(text, start.x, start.y);
      }
      break;
  }
};

export const exportToImage = (canvas: HTMLCanvasElement): void => {
  const image = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.download = `collaborative-whiteboard-${new Date().toISOString()}.png`;
  link.href = image;
  link.click();
};

export const exportToPDF = async (
  canvas: HTMLCanvasElement,
  fabricCanvas?: FabricCanvas | null
): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    let imgData: string;
    if (fabricCanvas && typeof fabricCanvas.toDataURL === 'function') {
      imgData = fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
    } else {
      imgData = canvas.toDataURL('image/png', 1.0);
    }
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`collaborative-whiteboard-${new Date().toISOString()}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export to PDF. Please try again.');
  }
};
