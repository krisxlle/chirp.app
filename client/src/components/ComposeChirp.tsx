import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import ImagePickerButton from './ImagePickerButton';
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
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for textarea focus handling
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user: authUser, isLoading } = useAuth();
  const { toast } = useToast();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  console.log('ComposeChirp: authUser available:', !!authUser, 'authUser.id:', authUser?.id);

  // Safety check - if user is not available, show a loading state
  if (!authUser || !authUser.id) {
    console.log('ComposeChirp: User not available, showing loading state');
    return (
      <div style={{
        backgroundColor: '#ffffff',
        marginTop: 0,
        marginBottom: 3,
        borderRadius: 16,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 16,
        paddingRight: 16,
        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 32,
          paddingBottom: 32
        }}>
          <p style={{
            fontSize: 18,
            color: '#6b7280',
            fontWeight: '600'
          }}>Loading compose...</p>
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
      
      // Use Supabase directly instead of API
      console.log('Creating chirp via Supabase...');
      console.log('User ID for chirp creation:', user.id);
      
      // Create Supabase client directly for web
      const { createClient } = await import('@supabase/supabase-js');
      
      const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: {
            getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
            setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
            removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
          },
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      
      // Handle non-UUID user IDs by finding the correct user in the database
      let authorId = user.id;
      
      // Check if user ID is not a UUID (like "1")
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.log('⚠️ User ID is not a UUID, looking up correct user in database...');
        
        // Try to find the user by email or handle
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .or(`email.eq.${user.email},handle.eq.${user.handle},custom_handle.eq.${user.customHandle}`)
          .single();
        
        if (userError || !userData) {
          console.error('❌ Could not find user in database:', userError);
          throw new Error('User not found in database');
        }
        
        authorId = userData.id;
        console.log('✅ Found correct user ID:', authorId);
      }
      
      // Post single chirp
      const { data: chirp, error } = await supabase
          .from('chirps')
          .insert({
            content: content.trim(),
            author_id: authorId
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating chirp:', error);
          throw error;
        }
        
        console.log('✅ Chirp created:', chirp);
        
        if (chirp) {
          // Call the onPost callback to update the UI
          await onPost?.(content.trim(), imageData || undefined);
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
    if (remainingChars < 0) return '#ef4444'; // red
    if (remainingChars < 20) return '#f59e0b'; // yellow
    return '#6b7280'; // gray
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Also ensure the cursor is positioned at the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  };

  // Normal compose mode
  return (
    <div style={{
      backgroundColor: '#ffffff',
      marginTop: 3,
      marginBottom: 3,
      borderRadius: 16,
      paddingTop: isMobile ? 8 : 4,
      paddingBottom: isMobile ? 8 : 4,
      paddingLeft: 16,
      paddingRight: 16,
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
      maxWidth: '600px',
      alignSelf: 'center',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start'
      }}>
        <UserAvatar user={user} size="md" showFrame={true} />
        
        <div style={{
          flex: 1,
          marginLeft: 8,
          overflow: 'hidden',
          cursor: 'text',
          position: 'relative',
          zIndex: 1,
          minHeight: 'auto',
          paddingTop: isMobile ? '12px' : '8px'
        }}
        onClick={handleTextareaClick}
        >
          <textarea
            ref={textareaRef}
            className="compose-textarea"
            style={{
              fontSize: 18,
              lineHeight: 24,
              minHeight: 30,
              maxHeight: 120,
              padding: '8px 0',
              color: '#1a1a1a',
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              cursor: 'text',
              fontFamily: 'inherit',
              position: 'relative',
              zIndex: 2,
              caretColor: '#1a1a1a'
            }}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              handleTextareaClick();
            }}
            onFocus={() => {
              // Ensure cursor is at the end when focused
              setTimeout(() => {
                if (textareaRef.current) {
                  const length = textareaRef.current.value.length;
                  textareaRef.current.setSelectionRange(length, length);
                }
              }, 0);
            }}
            maxLength={maxLength}
          />
          
          {/* Image Preview */}
          {selectedImage && (
            <div style={{
              marginTop: 12,
              marginBottom: 8,
              overflow: 'hidden',
              borderRadius: 12
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={selectedImage}
                  alt="Selected image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 12,
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Prevent XSS by ensuring src is safe
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <button
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    padding: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={handleRemoveImage}
                >
                  <span style={{ fontSize: 16 }}>×</span>
                </button>
              </div>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isPosting}
                size={20}
                color="#7c3aed"
              />
              
              <span style={{
                fontSize: 14,
                fontWeight: '500',
                color: getCharCountColor(),
                marginLeft: 12
              }}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
              </span>
            </div>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(124, 58, 237, 0.3)',
                cursor: 'pointer',
                opacity: ((!content.trim() && !selectedImage) || content.length > maxLength || isPosting) ? 0.5 : 1,
                border: 'none'
              }}
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedImage) || content.length > maxLength || isPosting}
            >
              <span style={{
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '700'
              }}>
                {isPosting ? "Posting..." : "Chirp"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}