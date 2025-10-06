import { X } from 'lucide-react';
import { useEffect } from 'react';

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


  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center" 
      style={{ 
        zIndex: 2000, // Higher than floating compose button (1000)
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
      {/* Close button - white X in white circle */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20
        }}
      >
        <X className="h-6 w-6" style={{ color: 'black' }} />
      </button>

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
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            display: 'block',
            margin: 'auto'
          }}
          draggable={false}
        />
      </div>

    </div>
  );
}
