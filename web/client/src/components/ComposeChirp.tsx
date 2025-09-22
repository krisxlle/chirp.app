import { X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';
import ImagePickerButton from './ImagePickerButton';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => Promise<void> | void;
}

// Thread Icon Component
const ThreadIcon = ({ size = 16, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5Z" 
      fill={color}
    />
  </svg>
);

export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [threadChirps, setThreadChirps] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const { user: authUser, isLoading } = useAuth();
  const { toast } = useToast();
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  console.log('ComposeChirp: authUser available:', !!authUser, 'authUser.id:', authUser?.id);

  // Safety check - if user is not available, show a loading state
  if (!authUser || !authUser.id) {
    console.log('ComposeChirp: User not available, showing loading state');
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
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

  const addToThread = () => {
    if (!content.trim()) {
      toast({
        title: "Empty chirp",
        description: "Please write something before adding to thread.",
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

    setThreadChirps([...threadChirps, content.trim()]);
    setContent("");
    // Note: Images are not supported in threads for now
    if (selectedImage) {
      toast({
        title: "Thread Mode",
        description: "Images are not supported in threads. The image will be removed.",
        variant: "destructive",
      });
      setSelectedImage(null);
    }
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

    if (isThreadMode) {
      // In thread mode, we're posting the entire thread
      // First check if we have any content at all
      const hasCurrentContent = content.trim();
      const hasThreadChirps = threadChirps.length > 0;
      
      if (!hasCurrentContent && !hasThreadChirps) {
        toast({
          title: "Empty thread",
          description: "Please write something before posting your thread.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate current content if it exists
      if (hasCurrentContent && content.length > maxLength) {
        toast({
          title: "Too long",
          description: `Current chirp must be ${maxLength} characters or less.`,
          variant: "destructive",
        });
        return;
      }
    } else {
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
    }

    setIsPosting(true);
    
    try {
      let imageData = null;
      
      // Upload image if one is selected
      if (selectedImage && !isThreadMode) {
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
      
      if (isThreadMode) {
        // Create the complete thread content array
        const allThreadContent = [...threadChirps];
        if (content.trim()) {
          allThreadContent.push(content.trim());
        }
        
        console.log('🔄 Creating thread with', allThreadContent.length, 'parts');
        
        // Create the thread using the API
        const response = await apiRequest('/api/chirps/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: allThreadContent,
            userId: user.id
          })
        });
        
        console.log('✅ Thread created with', response.length, 'chirps');
        
        setThreadChirps([]);
        setIsThreadMode(false);
      } else {
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
      }
      
      setContent("");
      setSelectedImage(null);
      
      toast({
        title: "Posted!",
        description: isThreadMode ? "Your thread has been shared." : "Your chirp has been shared.",
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

  const removeFromThread = (index: number) => {
    const newThreadChirps = threadChirps.filter((_, i) => i !== index);
    setThreadChirps(newThreadChirps);
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return 'text-red-500';
    if (remainingChars < 20) return 'text-yellow-500';
    return 'text-gray-500';
  };

  if (isThreadMode) {
    // Thread mode - extend the compose field
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="flex space-x-3">
          <UserAvatar user={user} size="md" />
          
          <div className="flex-1">
            <Textarea
              className="w-full resize-none border-none focus-visible:ring-0 text-base p-0 dark:bg-gray-900 dark:text-white min-h-[100px]"
              placeholder="Start a thread..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
            />
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addToThread}
                  disabled={!content.trim() || content.length > maxLength}
                  className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800"
                >
                  <ThreadIcon size={16} color="#7c3aed" />
                  <span className="ml-1">Add</span>
                </Button>
                
                <span className={`text-sm ${getCharCountColor()}`}>
                  {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
                </span>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={(threadChirps.length === 0 && !content.trim()) || isPosting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isPosting ? "Posting..." : "Post all"}
              </Button>
            </div>
          </div>
        </div>

        {/* Thread List */}
        {threadChirps.length > 0 && (
          <div className="mt-4 space-y-2">
            {threadChirps.map((chirp, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">{chirp}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Chirp {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromThread(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Normal compose mode
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
      <div className="flex space-x-3">
        <UserAvatar user={user} size="md" />
        
        <div className="flex-1">
          <Textarea
            className="w-full resize-none border-none focus-visible:ring-0 text-base p-0 dark:bg-gray-900 dark:text-white min-h-[100px]"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsThreadMode(true)}
                className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800"
              >
                <ThreadIcon size={16} color="#7c3aed" />
                <span className="ml-1">Thread</span>
              </Button>
              
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isThreadMode || isPosting}
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