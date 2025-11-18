import React, { useState } from 'react';
import FrameSelection from './components/FrameSelection';
import LandingPage from './components/LandingPage';
import CameraPage from './components/CameraPage';
import CapturePage from './components/CapturePage';
import CoverPage from './components/CoverPage';
import { type Frame } from './types';

export default function App() {
  const [page, setPage] = useState<'cover' | 'upload' | 'frames' | 'editor' | 'capture'>('cover');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);

  const handleStart = () => {
    setPage('upload');
  };

  const handleImageSelected = (image: string) => {
    setSelectedImage(image);
    setPage('frames');
  };
  
  const handleGoToCapture = () => {
    setPage('capture');
  };

  const handleFrameSelected = (frame: Frame | null) => {
    setSelectedFrame(frame);
    setPage('editor');
  };

  const handleBackToUpload = () => {
    setSelectedImage(null);
    setSelectedFrame(null);
    setPage('upload');
  }

  const handleBackToFrames = () => {
    setSelectedFrame(null);
    setPage('frames');
  }

  return (
    <>
      {page === 'cover' && <CoverPage onStart={handleStart} />}
      {page === 'upload' && <LandingPage onImageSelect={handleImageSelected} onTakePicture={handleGoToCapture} />}
      {page === 'capture' && <CapturePage onPhotoTaken={handleImageSelected} onBack={handleBackToUpload} />}
      {page === 'frames' && selectedImage && (
        <FrameSelection 
          onSelectFrame={handleFrameSelected}
          onBack={handleBackToUpload}
        />
      )}
      {page === 'editor' && selectedImage && (
        <CameraPage
          imageSrc={selectedImage}
          frame={selectedFrame}
          onBack={handleBackToFrames}
          onStartOver={handleBackToUpload}
        />
      )}
    </>
  );
}