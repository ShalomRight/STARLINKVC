import React from 'react';
import { Star } from 'lucide-react';

interface CoverPageProps {
  onStart: () => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center space-y-8">
        {/* Placeholder for the main image - Replace src with your 1080px image */}
        <div className="w-full aspect-[3/4] bg-black/20 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 flex items-center justify-center">
           <img 
             src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.facebook.com%2Funitylabourparty%2F&psig=AOvVaw3E4uz6boEjwpSR_mk1_j79&ust=1763584939877000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCJiFt4HI_JADFQAAAAAdAAAAABAE" 
             alt="Event Cover"
             className="w-full h-full object-cover"
           />
        </div>
        
        <button 
          onClick={onStart}
          className="w-full bg-white text-red-600 font-black text-2xl py-5 px-8 rounded-full shadow-xl hover:bg-gray-50 hover:scale-105 transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          <Star className="w-6 h-6 fill-current" />
          Become a Star
        </button>
      </div>
    </div>
  );
};

export default CoverPage;