import React, { useRef } from 'react';
import { Button } from './ui/button';
import { ImageIcon, X } from 'lucide-react';

interface ImagePickerButtonProps {
  onImageSelected: (imageUri: string) => void;
  disabled?: boolean;
  size?: number;
  color?: string;
}

export default function ImagePickerButton({ 
  onImageSelected, 
  disabled = false, 
  size = 20, 
  color = "#7c3aed" 
}: ImagePickerButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      onImageSelected(imageUrl);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800"
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
    </>
  );
}
