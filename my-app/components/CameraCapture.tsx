
import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XMarkIcon } from './Icons';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access the camera. Please ensure permissions are granted.");
        onCancel();
      }
    };
    enableCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-lg shadow-xl overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <button onClick={onCancel} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
            <XMarkIcon className="w-6 h-6"/>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
            <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full bg-white/30 border-4 border-white flex items-center justify-center text-white hover:bg-white/50 transition"
            aria-label="Capture photo"
            >
                <CameraIcon className="w-10 h-10" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
