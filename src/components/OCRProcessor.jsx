import React, { useEffect } from 'react';
import { createWorker } from 'tesseract.js';

const OCRProcessor = ({ imageData, onTextExtracted, onLoading }) => {
    useEffect(() => {
        if (!imageData) return;

        const processImage = async () => {
            onLoading(true);
            console.log("Starting OCR...");

            try {
                // Load image to crop
                const img = new Image();
                img.src = imageData;
                await new Promise((resolve) => (img.onload = resolve));

                // Crop to center 75%
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const w = img.width;
                const h = img.height;
                const cw = w * 0.75;
                const ch = h * 0.75;
                const cx = (w - cw) / 2;
                const cy = (h - ch) / 2;

                canvas.width = cw;
                canvas.height = ch;
                ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);

                const croppedParams = canvas.toDataURL('image/jpeg');

                // Initialize Tesseract with optimized settings
                const worker = await createWorker('eng', 1, {
                    logger: m => console.log(m) // Optional: log progress
                });

                // Set parameters for faster processing
                await worker.setParameters({
                    tessedit_pageseg_mode: '6', // Uniform block of text
                    tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine
                });

                const ret = await worker.recognize(croppedParams);
                const extractedText = ret.data.text.trim();
                
                // Console log the text found in the image
                console.log("=== Text found in image ===");
                console.log(extractedText);
                console.log("===========================");

                onTextExtracted(extractedText);
                await worker.terminate();
            } catch (error) {
                console.error("OCR Error:", error);
            } finally {
                onLoading(false);
            }
        };

        processImage();
    }, [imageData, onTextExtracted, onLoading]);

    return null;
};

export default OCRProcessor;
