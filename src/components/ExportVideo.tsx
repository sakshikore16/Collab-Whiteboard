import React, { useRef, useState } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface ExportVideoProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ExportVideo: React.FC<ExportVideoProps> = ({ canvasRef }) => {
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
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsExporting(true);
      toast.success('Recording stopped, exporting video...');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Export Drawing Process</h2>
      <div className="flex gap-2">
        <Button
          onClick={startRecording}
          disabled={isRecording || isExporting}
        >
          Start Recording
        </Button>
        <Button
          onClick={stopRecording}
          disabled={!isRecording || isExporting}
          variant="destructive"
        >
          Stop Recording
        </Button>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
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