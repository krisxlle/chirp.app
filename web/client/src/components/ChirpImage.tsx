import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Eye, EyeOff } from 'lucide-react';

interface ChirpImageProps {
  imageUrl: string;
  imageAltText?: string;
  imageWidth?: number;
  imageHeight?: number;
  onImagePress?: () => void;
}

export default function ChirpImage({ 
  imageUrl, 
  imageAltText, 
  imageWidth, 
  imageHeight,
  onImagePress 
}: ChirpImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl || imageError) {
    return null;
  }

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

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

  return (
    <div className="relative mt-3 rounded-lg overflow-hidden bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={imageAltText || 'Chirp image'}
        className={`w-full h-auto cursor-pointer transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          maxWidth: imageWidth ? `${imageWidth}px` : '100%',
          maxHeight: imageHeight ? `${imageHeight}px` : '400px',
          objectFit: 'cover'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onImagePress}
      />
      
      {/* Image overlay with actions */}
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Alt text indicator */}
      {imageAltText && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {imageAltText}
        </div>
      )}
    </div>
  );
}
