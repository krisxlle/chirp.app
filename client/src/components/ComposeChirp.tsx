import { uploadChirpImage } from '@/lib/imageUpload';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import ImagePickerButton from './ImagePickerButton';
import { brandGradient, C, font } from '../lib/chirpBrand';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => Promise<void> | void;
}

/** Taller compose area; fixed empty height keeps placeholder at top (not vertically centered). */
const COMPOSE_MIN_HEIGHT_PX = 116;
const COMPOSE_MAX_HEIGHT_PX = 456;
const AVATAR_COLUMN_PX = 45;
const AVATAR_TEXT_GAP_PX = 10;
const TOOLBAR_INDENT_PX = AVATAR_COLUMN_PX + AVATAR_TEXT_GAP_PX;

export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [, setIsUploadingImage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [composeHeight, setComposeHeight] = useState(COMPOSE_MIN_HEIGHT_PX);
  const [composeScrolls, setComposeScrolls] = useState(false);

  // Refs for textarea focus handling
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user: authUser } = useSupabaseAuth();
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

  // Lock empty state to a short height (React `style.height` must match — DOM-only height gets reset).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!content.trim()) {
      setComposeHeight(COMPOSE_MIN_HEIGHT_PX);
      setComposeScrolls(false);
      return;
    }
    el.style.height = 'auto';
    const sh = el.scrollHeight;
    const next = Math.min(Math.max(sh, COMPOSE_MIN_HEIGHT_PX), COMPOSE_MAX_HEIGHT_PX);
    setComposeHeight(next);
    setComposeScrolls(sh > COMPOSE_MAX_HEIGHT_PX);
  }, [content, authUser?.id]);
  
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
        boxShadow: '0 2px 8px rgba(162, 64, 209, 0.1)',
        border: `1px solid ${C.lightBlueGrey}`,
        maxWidth: 600,
        alignSelf: 'stretch',
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
            ...font.bodyMedium,
          }}>Loading compose...</p>
        </div>
      </div>
    );
  }

  // Use the transformed user from SupabaseAuthContext directly
  const user = authUser;

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
          // Upload image to storage and get proper URL
          imageData = await uploadChirpImage(selectedImage, user.id);
          
          console.log('✅ Image uploaded successfully:', imageData.imageUrl);
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
      
      // Using singleton Supabase client
      
      // Use user ID directly (Supabase auth IDs are UUIDs)
      let authorId = user.id;
      
      // Double-check user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authorId)
        .single();
      
      if (userError || !userData) {
        console.error('❌ User not found in database:', userError);
        throw new Error('User profile not found in database. Please ensure you have completed signup.');
      }
      
      console.log('✅ User verified in database:', authorId);
      
      // Post single chirp with image data
      const chirpData: any = {
        content: content.trim(),
        author_id: authorId
      };
      
      // Add image data if provided
      if (imageData) {
        chirpData.image_url = imageData.imageUrl;
        chirpData.image_width = imageData.imageWidth || null;
        chirpData.image_height = imageData.imageHeight || null;
      }
      
      const { data: chirp, error } = await supabase
          .from('chirps')
          .insert(chirpData)
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
    return '#6b7280';
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
      border: `1px solid ${C.lightBlueGrey}`,
      paddingTop: isMobile ? 14 : 12,
      paddingBottom: isMobile ? 18 : 16,
      paddingLeft: 16,
      paddingRight: 22,
      boxShadow: '0 2px 8px rgba(162, 64, 209, 0.1)',
      maxWidth: '600px',
      alignSelf: 'stretch',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: `${AVATAR_TEXT_GAP_PX}px`,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <div style={{ flexShrink: 0, overflow: 'visible', marginLeft: 4, marginRight: 2 }}>
          <UserAvatar user={user} size="md" showFrame={true} />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            cursor: 'text',
            position: 'relative',
            zIndex: 1,
            paddingTop: 1,
          }}
          onClick={handleTextareaClick}
        >
          <textarea
            ref={textareaRef}
            className="compose-textarea"
            style={{
              fontSize: 17,
              lineHeight: '22px',
              height: composeHeight,
              minHeight: COMPOSE_MIN_HEIGHT_PX,
              maxHeight: COMPOSE_MAX_HEIGHT_PX,
              padding: '4px 0 0 0',
              margin: 0,
              boxSizing: 'border-box',
              color: C.deepPurple,
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              overflowY: composeScrolls ? 'auto' : 'hidden',
              cursor: 'text',
              textAlign: 'left',
              display: 'block',
              ...font.body,
              position: 'relative',
              zIndex: 2,
              caretColor: C.deepPurple,
            }}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              handleTextareaClick();
            }}
            onFocus={() => {
              setTimeout(() => {
                if (textareaRef.current) {
                  const length = textareaRef.current.value.length;
                  textareaRef.current.setSelectionRange(length, length);
                }
              }, 0);
            }}
            maxLength={maxLength}
          />

          {selectedImage && (
            <div
              style={{
                marginTop: 8,
                marginBottom: 6,
                overflow: 'hidden',
                borderRadius: 12,
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={selectedImage}
                  alt="Selected image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 160,
                    borderRadius: 12,
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <button
                  type="button"
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
                    justifyContent: 'center',
                  }}
                  onClick={handleRemoveImage}
                >
                  <span style={{ fontSize: 16 }}>×</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          paddingLeft: TOOLBAR_INDENT_PX,
          paddingRight: 4,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <ImagePickerButton
            onImageSelected={handleImageSelected}
            disabled={isPosting}
            size={18}
            color={C.vibrantPurple}
          />

          <span
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: getCharCountColor(),
              marginLeft: 10,
            }}
          >
            {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
          </span>
        </div>

        <button
          type="button"
          style={{
            background: brandGradient,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(162, 64, 209, 0.35)',
            cursor: 'pointer',
            opacity:
              (!content.trim() && !selectedImage) || content.length > maxLength || isPosting ? 0.5 : 1,
            border: 'none',
          }}
          onClick={handleSubmit}
          disabled={(!content.trim() && !selectedImage) || content.length > maxLength || isPosting}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: 13,
              ...font.bodyMedium,
            }}
          >
            {isPosting ? 'Posting...' : 'Chirp'}
          </span>
        </button>
      </div>
    </div>
  );
}