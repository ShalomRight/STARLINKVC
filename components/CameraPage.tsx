
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
    a.download = `photo-frame-studio-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Uses Native Web Share API to share the FILE directly (no cloud upload)
  const handleShare = async () => {
    if (!compositedImage) return;
    setShareError(null);
    
    try {
        // Convert base64 to blob
        const res = await fetch(compositedImage);
        const blob = await res.blob();
        const file = new File([blob], `star-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'My Star Photo',
                text: 'Check out my photo!',
            });
        } else {
            // Fallback if file sharing not supported
             setShareError("Native sharing not supported on this device. Please use Download.");
        }
    } catch (error) {
        console.error('Error sharing:', error);
        setShareError('Could not share photo.');
    }
  };

  // Uploads to Cloudinary and shares the Link
  const handleStarLink = async () => {
    if (!compositedImage || isStarLinking) return;
    setIsStarLinking(true);
    setShareError(null);

    try {
      await uploadToCloudinary(compositedImage);
      
      // if (navigator.share) {
      //   await navigator.share({
      //     title: 'My Star Photo',
      //     text: 'Check out the photo I framed!',
      //     url: publicUrl,
      //   });
      // } else {
      //   await navigator.clipboard.writeText(publicUrl);
      //   alert('Star Link copied to clipboard!');
      // }
    } catch (error) {
      console.error('Star Link error:', error);
      if (error instanceof Error) {
        setShareError(`Star Link failed: ${error.message}. Check Cloudinary config.`);
      } else {
        setShareError('An unknown error occurred.');
      }
    } finally {
      setIsStarLinking(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 text-gray-800 flex flex-col">
       <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Preview & Share</h2>
        <button onClick={onStartOver} className="p-2 hover:bg-gray-200 rounded-full">
            <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="hidden" />
            {isProcessing && (
                <div className="w-full h-full flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                </div>
            )}
            {compositedImage && !isProcessing && (
                <img src={compositedImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg" />
            )}
            {!compositedImage && !isProcessing && (
                 <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gray-200">
                    <p>Error creating image.</p>
                </div>
            )}
        </div>
      </main>

      <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-10">
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
             {/* Button 1: Download */}
             <button
              onClick={handleDownload}
              disabled={isProcessing || !compositedImage}
              className="flex flex-col items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-2 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">Download</span>
            </button>

            {/* Button 2: Share (Native Web Share) */}
            <button
              onClick={handleShare}
              disabled={isProcessing || !compositedImage}
              className="flex flex-col items-center justify-center gap-1 bg-gray-900 text-white font-semibold py-3 px-2 rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Share</span>
            </button>
            
            {/* Button 3: Star Link (Cloudinary Upload) */}
            <button
              onClick={handleStarLink}
              disabled={isProcessing || !compositedImage || isStarLinking}
              className="flex flex-col items-center justify-center gap-1 bg-red-600 text-white font-semibold py-3 px-2 rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-red-200"
            >
              {isStarLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5 fill-white" />}
              <span className="text-xs">{isStarLinking ? 'Linking...' : 'Star Link'}</span>
            </button>
        </div>
        {shareError && <p className="text-red-600 text-center text-sm mt-3">{shareError}</p>}
      </footer>
    </div>
  );
};

export default CameraPage;
