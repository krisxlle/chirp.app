import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string;
  imageAltText?: string;
  onClose: () => void;
}

export default function ImageViewerModal({ 
  visible, 
  imageUrl, 
  imageAltText, 
  onClose 
}: ImageViewerModalProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chirp-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center" 
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Image controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleRotate}
        >
          <RotateCw className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Reset button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white hover:bg-white/20"
        onClick={handleReset}
      >
        Reset View
      </Button>

      {/* Image container */}
      <div 
        className="flex items-center justify-center w-full h-full p-4" 
        style={{ 
          minHeight: '100vh',
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      >
        <img
          src={imageUrl}
          alt={imageAltText || 'Chirp image'}
          className="object-contain"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 'auto',
            height: 'auto',
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out',
            display: 'block',
            margin: 'auto'
          }}
          draggable={false}
        />
      </div>

      {/* Alt text */}
      {imageAltText && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-2 rounded">
          {imageAltText}
        </div>
      )}
    </div>
  );
}
