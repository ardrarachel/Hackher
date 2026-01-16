import React, { useState } from 'react';
import { Camera } from 'lucide-react';

const CameraView = ({ onImageCapture }) => {
    const [preview, setPreview] = useState(null);

    const handleCapture = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onImageCapture(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 h-full bg-[#111]">
            {!preview ? (
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-[#1a1a1a] p-8 rounded-full border-4 border-[#ffb300] animate-pulse shadow-2xl">
                        <label htmlFor="camera-input" className="cursor-pointer block">
                            <Camera size={64} className="text-[#ffb300]" />
                        </label>
                    </div>
                    <p className="text-[#f5f5f5] text-lg font-medium">Tap icon to scan text</p>
                    <input
                        id="camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleCapture}
                    />
                </div>
            ) : (
                <div className="relative w-full h-full flex flex-col items-center">
                    {/* Image Preview */}
                    <img
                        src={preview}
                        alt="Captured"
                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl mb-4 border-2 border-[#333]"
                    />

                    <button
                        onClick={() => setPreview(null)}
                        className="bg-[#ffb300] hover:bg-[#ffa000] text-black px-6 py-2 rounded-lg font-semibold shadow-lg active:scale-95 transition-all duration-200 border-2 border-black/20"
                    >
                        Retake
                    </button>
                </div>
            )}
        </div>
    );
};

export default CameraView;
