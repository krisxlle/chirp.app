import React, { useState, useEffect } from 'react';

interface ChirpImageProps {
  imageUrl: string;
  imageAltText?: string;
  imageWidth?: number;
  imageHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onImagePress?: () => void;
}

export default function ChirpImage({ 
  imageUrl, 
  imageAltText, 
  imageWidth, 
  imageHeight,
  maxWidth,
  maxHeight,
  onImagePress 
}: ChirpImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    
    // Check if image is already loaded (cached)
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageUrl || imageError) {
    return null;
  }

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (error: any) => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
    <div style={{
      position: 'relative',
      marginTop: '12px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f3f4f6'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #7c3aed',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={imageAltText || 'Chirp image'}
        style={{
          width: '100%',
          height: 'auto',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
          opacity: isLoading ? 0 : 1,
          maxWidth: maxWidth ? `${maxWidth}px` : (imageWidth ? `${imageWidth}px` : '100%'),
          maxHeight: maxHeight ? `${maxHeight}px` : (imageHeight ? `${imageHeight}px` : '400px'),
          objectFit: 'cover'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={(e) => {
          e.stopPropagation();
          onImagePress?.();
        }}
      />
      
      {/* Image overlay with actions */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        opacity: 0,
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0';
      }}
      >
        <div style={{
          display: 'flex',
          gap: '4px'
        }}>
          <button
            style={{
              height: '32px',
              width: '32px',
              padding: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <span style={{ fontSize: '16px' }}>⬇️</span>
          </button>
        </div>
      </div>
      
      
      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
