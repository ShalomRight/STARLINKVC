import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Download, Share2, Loader2, RefreshCw, Link, Star } from 'lucide-react';
import { type Frame } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';

interface CameraPageProps {
  imageSrc: string;
  frame: Frame | null;
  onBack: () => void;
  onStartOver: () => void;
}

const CameraPage: React.FC<CameraPageProps> = ({ imageSrc, frame, onBack, onStartOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isStarLinking, setIsStarLinking] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const drawCanvas = useCallback(async () => {
    setIsProcessing(true);
    try {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const userImage = new Image();
        const userImagePromise = new Promise<void>((resolve, reject) => {
            userImage.onload = () => resolve();
            userImage.onerror = reject;
            userImage.src = imageSrc;
        });

        await userImagePromise;

        if (frame) {
            const frameImage = new Image();
            frameImage.crossOrigin = 'anonymous';
            const frameImagePromise = new Promise<void>((resolve, reject) => {
                frameImage.onload = () => resolve();
                frameImage.onerror = reject;
                frameImage.src = frame.url;
            });
            await frameImagePromise;

            const frameAspectRatio = (frameImage.width > 0 && frameImage.height > 0) ? frameImage.width / frameImage.height : 9 / 16;
            canvas.width = 1080;
            canvas.height = 1080 / frameAspectRatio;
            
            const userImageRatio = userImage.width / userImage.height;
            const canvasRatio = canvas.width / canvas.height;
            let sx, sy, sWidth, sHeight;

            if (userImageRatio > canvasRatio) {
                sHeight = userImage.height;
                sWidth = sHeight * canvasRatio;
                sx = (userImage.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = userImage.width;
                sHeight = sWidth / canvasRatio;
                sy = (userImage.height - sHeight) / 2;
                sx = 0;
            }

            ctx.drawImage(userImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        } else {
            const aspectRatio = userImage.width / userImage.height;
            const MAX_DIMENSION = 1920;
            if (userImage.width > userImage.height) {
                canvas.width = Math.min(userImage.width, MAX_DIMENSION);
                canvas.height = canvas.width / aspectRatio;
            } else {
                canvas.height = Math.min(userImage.height, MAX_DIMENSION);
                canvas.width = canvas.height * aspectRatio;
            }
            ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);
        }

        setCompositedImage(canvas.toDataURL('image/jpeg', 0.9));
    } catch (error) {
        console.error("Error loading images for canvas", error);
    } finally {
        setIsProcessing(false);
    }
  }, [imageSrc, frame]);
  
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    if (!compositedImage) return;
    const a = document.createElement('a');
    a.href = compositedImage;
    a.download = `ulp-star-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleShare = async () => {
    if (!compositedImage) return;
    setShareError(null);
    
    try {
        const res = await fetch(compositedImage);
        const blob = await res.blob();
        const file = new File([blob], `star-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'My ULP Photo',
                text: 'Check out my photo!',
            });
        } else {
             setShareError("Native sharing not supported. Please use Download.");
        }
    } catch (error) {
        console.error('Error sharing:', error);
        setShareError('Could not share photo.');
    }
  };

  const handleStarLink = async () => {
    if (!compositedImage || isStarLinking) return;
    setIsStarLinking(true);
    setShareError(null);

    try {
      await uploadToCloudinary(compositedImage);
    } catch (error) {
      console.error('Star Link error:', error);
      if (error instanceof Error) {
        setShareError(`Star Link failed: ${error.message}.`);
      } else {
        setShareError('An unknown error occurred.');
      }
    } finally {
      setIsStarLinking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-red-700 text-white">
       {/* Header */}
       <header className="flex items-center justify-between p-4 bg-red-700 z-10 flex-none">
        <button onClick={onBack} className="p-2 hover:bg-red-800 rounded transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-sans font-black italic text-white uppercase tracking-tighter transform -skew-x-6">Review</h2>
        <button onClick={onStartOver} className="p-2 hover:bg-red-800 rounded transition-colors">
            <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Canvas Container */}
      <main className="flex-1 bg-neutral-100 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="hidden" />
            
            {isProcessing && (
                <div className="flex flex-col items-center gap-3 text-neutral-900">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                    <p className="font-sans font-black italic uppercase tracking-wider">Generating...</p>
                </div>
            )}
            
            {compositedImage && !isProcessing && (
                <img src={compositedImage} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl border-4 border-white" />
            )}
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-4 bg-red-700 z-10 flex-none shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-3 gap-3">
             {/* Download */}
             <button
              onClick={handleDownload}
              disabled={isProcessing || !compositedImage}
              className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-white text-red-700 font-black italic py-3 rounded-sm hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">Save</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              disabled={isProcessing || !compositedImage}
              className="flex flex-col items-center justify-center gap-1 bg-red-800 border-2 border-red-800 text-white font-black italic py-3 rounded-sm hover:bg-red-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider">Share</span>
            </button>
            
            {/* Star Link */}
            <button
              onClick={handleStarLink}
              disabled={isProcessing || !compositedImage || isStarLinking}
              className="flex flex-col items-center justify-center gap-1 bg-neutral-900 text-white font-black italic py-3 rounded-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-lg border-2 border-neutral-900"
            >
              {isStarLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5 fill-white" />}
              <span className="text-[10px] uppercase tracking-wider">{isStarLinking ? 'Uploading...' : 'Star Link'}</span>
            </button>
        </div>
        {shareError && <p className="text-white bg-red-800 p-2 mt-3 text-center text-xs font-black uppercase italic border border-red-600">{shareError}</p>}
      </footer>
    </div>
  );
};

export default CameraPage;