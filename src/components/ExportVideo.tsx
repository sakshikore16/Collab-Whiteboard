import React, { useRef, useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';

interface ExportVideoProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showNotification: (msg: string) => void;
}

export const ExportVideo: React.FC<ExportVideoProps> = ({ canvasRef, showNotification }) => {
  const { state } = useWhiteboard();
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!canvasRef.current) return;

    try {
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drawing-process-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
        setIsExporting(false);
        showNotification('Recording ended! Exporting video...');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      showNotification('Recording started!');
    } catch (error) {
      showNotification('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsExporting(true);
      showNotification('Recording stopped, exporting video...');
    }
  };

  return (
    <div>
      <h2 className="h5 mb-3">Export Drawing Process</h2>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={startRecording}
          disabled={isRecording || isExporting}
        >
          Start Recording
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={stopRecording}
          disabled={!isRecording || isExporting}
        >
          Stop Recording
        </button>
      </div>
      <div className="mt-3">
        <p className="small text-muted mb-0">
          {isRecording
            ? 'Recording in progress...'
            : isExporting
            ? 'Exporting video...'
            : 'Click "Start Recording" to begin capturing the drawing process'}
        </p>
      </div>
    </div>
  );
}; 