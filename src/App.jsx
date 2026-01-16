import React, { useState, useRef } from 'react';
import OCRProcessor from './components/OCRProcessor';
import BionicOverlay from './components/BionicOverlay';
import { Camera, Loader2, Star } from 'lucide-react';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setText(null);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextExtracted = (extractedText) => {
    setText(extractedText);
    setIsProcessing(false);
  };

  const handleRetake = () => {
    setImage(null);
    setText(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#FFFAF0] p-4 font-sans">
      {/* Simple Header */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#2D3748] text-center">
          📚 Super Reading Helper
        </h1>

        {/* Camera Button - Prominent and Child-Friendly */}
        {!image && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <button
              onClick={handleCameraClick}
              className="group relative p-8 rounded-full bg-white border-4 border-[#FFD700] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Camera 
                size={80} 
                className="text-[#3182CE] group-hover:text-[#38A169] transition-colors duration-300" 
              />
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Star size={24} className="text-[#FFD700] fill-[#FFD700]" />
              </div>
            </button>
            <p className="mt-6 text-lg text-[#2D3748] font-semibold">
              Tap the camera to scan your page! 📸
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Image Viewer */}
        {image && (
          <div className="space-y-4">
            {/* Image Container - Only show image during processing */}
            {!text && (
              <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden bg-black border-4 border-[#FFD700] shadow-2xl">
                <div className="relative">
                  {/* Background Image */}
                  <img
                    src={image}
                    alt="Scanned page"
                    className="w-full h-auto block"
                  />

                  {/* OCR Processor */}
                  <OCRProcessor
                    imageData={image}
                    onTextExtracted={handleTextExtracted}
                    onLoading={setIsProcessing}
                  />

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                      <Loader2 size={48} className="animate-spin mb-4 text-[#FFD700]" />
                      <p className="text-lg font-semibold animate-pulse text-white">
                        Reading your page... 📖
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bionic Text Display - Separate from image */}
            {text && (
              <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white border-4 border-[#FFD700] shadow-2xl p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-[#2D3748]">📖 Your Bionic Reading Text</h2>
                  <p className="text-sm text-[#718096]">Tap words to simplify them!</p>
                </div>
                <BionicOverlay text={text} />
              </div>
            )}

            {/* Retake Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-full bg-white border-2 border-[#A0AEC0] text-[#2D3748] font-semibold hover:bg-[#3182CE] hover:text-white hover:border-[#3182CE] transition-all duration-200 shadow-md"
              >
                📷 Take New Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
