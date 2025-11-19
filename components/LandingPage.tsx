import React, { useState } from 'react';
import { UploadCloud, Loader2, Camera, Star  } from 'lucide-react';

interface LandingPageProps {
  onImageSelect: (image: string) => void;
  onTakePicture: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageSelect, onTakePicture }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }

    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            onImageSelect(e.target.result as string);
        } else {
            setError('Could not read the image.');
        }
        setIsLoading(false);
    };
    reader.onerror = () => {
        setError('Error reading file.');
        setIsLoading(false);
    }
    reader.readAsDataURL(file);
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-red-700 p-8 pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] text-red-800 opacity-50">
             <Star className="w-32 h-32 fill-current" />
        </div>

        <div className="flex justify-center mb-4 relative z-10">
          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-full shadow-md border-4 border-neutral-900">
             <Star className="w-8 h-8 text-red-700 fill-current" />
          </div>
        </div>
        <h1 className="text-4xl font-sans font-black italic text-center text-white mb-1 uppercase tracking-tighter relative z-10 transform -skew-x-6">
          Join The Team
        </h1>
        <p className="text-red-100 text-center mt-2 font-sans font-bold uppercase tracking-wide text-sm relative z-10">
          Upload your photo to show support
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6 space-y-6 relative">
        
        <div className="space-y-4">
            {/* Upload Button */}
            <label htmlFor="image-upload" className="w-full cursor-pointer bg-neutral-900 text-white font-black italic py-5 px-6 shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider transform -skew-x-3">
              <div className="transform skew-x-3 flex items-center gap-3">
                {isLoading ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                    </>
                ) : (
                    <>
                    <UploadCloud className="w-6 h-6" />
                    Select a Photo
                    </>
                )}
              </div>
            </label>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
            
            {/* Separator */}
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t-2 border-gray-100"></div>
                <span className="flex-shrink-0 mx-4 text-red-700 font-black italic text-xl">OR</span>
                <div className="flex-grow border-t-2 border-gray-100"></div>
            </div>

            {/* Camera Button */}
            <button 
              onClick={onTakePicture} 
              className="w-full cursor-pointer bg-white text-red-700 border-4 border-red-700 font-black italic py-5 px-6 shadow-sm hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider transform -skew-x-3"
              disabled={isLoading}
            >
              <div className="transform skew-x-3 flex items-center gap-3">
                <Camera className="w-6 h-6" />
                Take a Picture
              </div>
            </button>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 font-bold text-center border-2 border-red-100 uppercase italic">{error}</div>}
      </div>

      {/* Footer */}
      <div className="p-6 text-center bg-neutral-100 border-t border-gray-200">
        <p className="text-xs text-neutral-400 font-sans font-black tracking-widest uppercase italic">Unity Labour Party</p>
      </div>
    </div>
  );
}

export default LandingPage;