import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';
import { SessionPanel } from '@/components/SessionPanel';
import { Chat } from '@/components/Chat';
import { InviteUsers } from '@/components/InviteUsers';
import { ExportVideo } from '@/components/ExportVideo';
import { WhiteboardProvider, useWhiteboard } from '@/context/WhiteboardContext';
import { exportToImage, exportToPDF } from '@/utils/drawingUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const isMobile = useIsMobile();
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 800 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dispatch } = useWhiteboard();

  // Update canvas size based on window size
  useEffect(() => {
    const updateCanvasSize = () => {
      const margin = isMobile ? 8 : 40;
      const sidebarWidth = isMobile ? 0 : 320; // 80 * 4 = 320px for w-80
      setCanvasSize({
        width: Math.max(200, window.innerWidth - sidebarWidth - margin * 2),
        height: Math.max(200, window.innerHeight - 120),
      });
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isMobile]);

  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    try {
      exportToImage(canvasRef.current);
      toast.success('Whiteboard exported as PNG');
    } catch (error) {
      toast.error('Failed to export whiteboard');
      console.error('Export error:', error);
    }
  };
  
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      await exportToPDF(canvasRef.current);
      toast.success('Whiteboard exported as PDF');
    } catch (error) {
      toast.error('Failed to export whiteboard');
      console.error('Export error:', error);
    }
  };

  const handleClearCanvas = () => {
    dispatch({ type: 'CLEAR_CANVAS' });
    toast.success('Whiteboard cleared');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Collaborative Whiteboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <SessionPanel />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className={`flex-1 flex min-h-0 ${isMobile ? 'flex-col' : 'flex-row'}`}>
        {/* Canvas area */}
        <div className={`flex-1 flex items-center justify-center min-h-0 h-full ${isMobile ? 'order-1' : ''}`}>
          <Canvas 
            width={canvasSize.width} 
            height={canvasSize.height}
            ref={canvasRef}
          />
        </div>
        
        {/* Sidebar */}
        <div className={`${isMobile ? 'w-full border-l-0 border-t' : 'w-80 border-l'} bg-white flex flex-col h-full min-h-0`}>
          <div className="flex-shrink-0">
            <InviteUsers />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Chat />
          </div>
          <div className="flex-shrink-0 border-t">
            <ExportVideo canvasRef={canvasRef} />
          </div>
        </div>
      </main>
      
      {/* Footer toolbar */}
      <footer className="flex justify-center p-2">
        <Toolbar 
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          onClearCanvas={handleClearCanvas}
        />
      </footer>
    </div>
  );
};

const IndexWithProvider = () => {
  return (
    <WhiteboardProvider>
      <Index />
    </WhiteboardProvider>
  );
};

export default IndexWithProvider;
