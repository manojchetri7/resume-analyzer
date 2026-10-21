import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, Check, X, RotateCw, Square, Circle } from 'lucide-react';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PhotoCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

/**
 * Creates an HTML Image element asynchronously
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Returns a cropped image as a Base64 data URL
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context could not be created');
  }

  // Set canvas size to the requested crop output size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the image slice onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.95);
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  imageSrc,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [cropShape, setCropShape] = useState<'round' | 'rect'>('round');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(croppedImage);
    } catch (e) {
      console.error('Cropping error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#07132E] border border-[#53D8FF]/30 p-6 shadow-2xl flex flex-col gap-5 text-[#F4F7FF]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#53D8FF]/15 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#F4F7FF]">Adjust & Crop Profile Photo</h3>
            <p className="text-xs text-[#A7B6D4]">
              Drag to reposition, zoom in/out, and choose circle or square frame.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Canvas Area */}
        <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape={cropShape}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Shape and Zoom Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Shape Selection */}
          <div className="flex items-center gap-2">
            <span className="text-[#A7B6D4] font-medium">Shape:</span>
            <div className="flex p-0.5 rounded-lg bg-[#0A1633] border border-slate-800">
              <button
                type="button"
                onClick={() => setCropShape('round')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                  cropShape === 'round'
                    ? 'bg-[#238BFF] text-white font-semibold shadow-sm'
                    : 'text-[#A7B6D4] hover:text-white'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Circle</span>
              </button>
              <button
                type="button"
                onClick={() => setCropShape('rect')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                  cropShape === 'rect'
                    ? 'bg-[#238BFF] text-white font-semibold shadow-sm'
                    : 'text-[#A7B6D4] hover:text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Square</span>
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <ZoomOut className="w-3.5 h-3.5 text-[#A7B6D4]" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full sm:w-28 accent-[#53D8FF]"
            />
            <ZoomIn className="w-3.5 h-3.5 text-[#A7B6D4]" />
            <span className="text-[11px] text-[#A7B6D4] w-8">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#53D8FF]/15">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-[#A7B6D4] hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#238BFF] to-[#7657FF] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(35,139,255,0.4)] transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Apply Photo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
