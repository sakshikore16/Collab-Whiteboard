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
import { Users } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 800 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dispatch } = useWhiteboard();
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight - 120; // Increased to account for header and footer
      setCanvasSize({
        width: Math.max(200, width - (isMobile ? 0 : 340)),
        height: Math.max(200, height - (isMobile ? 0 : 0)),
      });
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isMobile]);

  const showNotification = (msg: string) => {
    setNotifications((prev) => [...prev, msg]);
    setTimeout(() => setNotifications((prev) => prev.slice(1)), 3000);
  };

  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    try {
      exportToImage(canvasRef.current);
      showNotification('Whiteboard exported as PNG');
    } catch (error) {
      showNotification('Failed to export whiteboard');
      console.error('Export error:', error);
    }
  };
  
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    try {
      await exportToPDF(canvasRef.current);
      showNotification('Whiteboard exported as PDF');
    } catch (error) {
      showNotification('Failed to export whiteboard');
      console.error('Export error:', error);
    }
  };

  const handleClearCanvas = () => {
    dispatch({ type: 'CLEAR_CANVAS' });
    showNotification('Whiteboard cleared');
  };

  return (
    <>
      {/* Floating notifications in top left */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '72px', // just below the header
          left: '32px',
          zIndex: 2000,
          minWidth: '260px',
          maxWidth: '340px'
        }}>
          {notifications.map((msg, idx) => (
            <div
              key={idx}
              className="alert alert-info py-2 px-3 mb-2 shadow-sm fade show"
              role="alert"
              style={{
                fontSize: '1rem',
                background: '#fff',
                border: '1px solid #b6d4fe',
                color: '#084298'
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      )}
      <div className="container-fluid p-0 vh-100 d-flex flex-column bg-light overflow-hidden" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
        {/* Header */}
        <header className="bg-white border-bottom px-4 py-3 shadow-sm flex-shrink-0" style={{ height: '60px', position: 'relative', borderRadius: '8px 8px 0 0' }}>
          <div className="d-flex align-items-center justify-content-between h-100">
            <div className="d-flex align-items-center gap-3 position-relative">
              <h1 className="h4 fw-bold text-primary m-0">Collaborative Whiteboard</h1>
            </div>
            <div className="d-flex align-items-center gap-3">
              <SessionPanel showNotification={showNotification} />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow-1 row g-0 m-0 d-flex h-100 min-vh-0 position-relative overflow-hidden">
          {/* Canvas area */}
          <div className="col-12 col-md-9 d-flex align-items-center justify-content-center h-100 overflow-hidden p-2 p-md-4" style={{ minHeight: 0 }}>
            <div className="bg-white w-100 h-100 p-2" style={{ borderRadius: '8px', minHeight: '300px' }}>
              <Canvas 
                width={canvasSize.width} 
                height={canvasSize.height}
                ref={canvasRef}
              />
            </div>
          </div>

          {/* Sidebar: stack below canvas on mobile */}
          <div className="col-12 col-md-3 d-flex flex-column bg-white border-start h-100 overflow-hidden p-2 p-md-0" style={{ minWidth: 0, maxWidth: '100vw' }}>
            <div className="flex-shrink-0 px-2 px-md-3 pb-2 pb-md-3 border-bottom" style={{ minHeight: 120 }}>
              <InviteUsers showNotification={showNotification} />
            </div>
            <div className="flex-grow-1 overflow-auto px-2 px-md-3 py-2 py-md-3 border-bottom" style={{ minHeight: 80 }}>
              <Chat />
            </div>
            <div className="flex-shrink-0 px-2 px-md-3 pt-2 pt-md-3">
              <ExportVideo canvasRef={canvasRef} showNotification={showNotification} />
            </div>
          </div>
        </main>

        {/* Footer toolbar */}
        <footer className="bg-white border-top py-2 flex-shrink-0" style={{ height: '72px', borderRadius: '0 0 8px 8px', marginTop: '8px', overflowX: 'auto' }}>
          <div className="container-fluid h-100 d-flex align-items-center flex-nowrap" style={{ paddingBottom: '4px', overflowX: 'auto' }}>
            <Toolbar 
              onExportPNG={handleExportPNG}
              onExportPDF={handleExportPDF}
              onClearCanvas={handleClearCanvas}
            />
          </div>
        </footer>
      </div>
    </>
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
