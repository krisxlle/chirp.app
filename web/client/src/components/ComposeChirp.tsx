import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';
import ImagePickerButton from './ImagePickerButton';
import { Button } from './ui/button';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => Promise<void> | void;
}

export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Refs for textarea focus handling
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user: authUser, isLoading } = useAuth();
  const { toast } = useToast();
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  console.log('ComposeChirp: authUser available:', !!authUser, 'authUser.id:', authUser?.id);

  // Auto-resize textarea functionality
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  // Auto-resize on content change
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [content]);

  // Safety check - if user is not available, show a loading state
  if (!authUser || !authUser.id) {
    console.log('ComposeChirp: User not available, showing loading state');
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading compose...</p>
        </div>
      </div>
    );
  }

  // Convert auth user to expected User format for UserAvatar component
  const user = React.useMemo(() => ({
    id: authUser.id,
    firstName: authUser.firstName || authUser.name || authUser.email?.split('@')[0] || 'User',
    lastName: authUser.lastName || '',
    email: authUser.email,
    profileImageUrl: authUser.profileImageUrl || authUser.avatarUrl,
    customHandle: authUser.customHandle,
    handle: authUser.handle,
    bio: authUser.bio,
  }), [authUser]);

  console.log('ComposeChirp: Final user object:', user.id);
  console.log('ComposeChirp: User profile image:', user.profileImageUrl ? 'has image' : 'no image');

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    // Check if user is available
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to post a chirp.",
        variant: "destructive",
      });
      return;
    }

    // Normal mode - just check for content
    if (!content.trim() && !selectedImage) {
      toast({
        title: "Empty chirp",
        description: "Please write something or add an image before posting.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > maxLength) {
      toast({
        title: "Too long",
        description: `Chirps must be ${maxLength} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    
    try {
      let imageData = null;
      
      // Upload image if one is selected
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          // For web, we'll use the image URL directly
          // In a real implementation, you'd upload to a service like Cloudinary
          imageData = {
            imageUrl: selectedImage,
            imageAltText: content.trim() || 'Chirp image',
            imageWidth: 400,
            imageHeight: 300
          };
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Use API instead of direct database connection
      console.log('Creating chirp via API...');
      console.log('User ID for chirp creation:', user.id);
      
      // Post single chirp with image data
      const response = await apiRequest('/api/chirps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          userId: user.id,
          imageData: imageData
        })
      });
      
      if (response) {
        // Call the onPost callback to update the UI
        await onPost?.(content.trim(), imageData);
      }
      
      setContent("");
      setSelectedImage(null);
      
      toast({
        title: "Posted!",
        description: "Your chirp has been shared.",
      });
    } catch (error) {
      console.error('Error posting chirp:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return 'text-red-500';
    if (remainingChars < 20) return 'text-yellow-500';
    return 'text-gray-500';
  };

  // Normal compose mode
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-md mx-auto shadow-lg">
      <div className="flex space-x-3">
        <UserAvatar user={user} size="md" />
        
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            className="w-full min-h-[80px] resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white text-lg leading-6 placeholder-gray-500 dark:placeholder-gray-400"
            style={{
              fontSize: '18px',
              lineHeight: '24px',
              minHeight: '80px',
              padding: '12px',
              fontFamily: 'inherit',
              color: '#1a1a1a',
              textAlign: 'start'
            }}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              autoResizeTextarea(e.target);
            }}
            maxLength={maxLength}
          />
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="mt-3">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected image"
                  className="max-w-full max-h-48 rounded-lg object-cover"
                  onError={(e) => {
                    // Prevent XSS by ensuring src is safe
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isPosting}
                size={20}
                color="#7c3aed"
              />
              
              <span className={`text-sm ${getCharCountColor()}`}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
              </span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedImage) || content.length > maxLength || isPosting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isPosting ? "Posting..." : "Chirp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}