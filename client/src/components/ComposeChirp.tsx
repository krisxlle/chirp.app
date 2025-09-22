import React, { useRef, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';
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
  
  // Refs for textarea focus handling
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user: authUser, isLoading } = useAuth();
  const { toast } = useToast();
  
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
      
      if (isThreadMode) {
        // Create the complete thread content array
        const allThreadContent = [...threadChirps];
        if (content.trim()) {
          allThreadContent.push(content.trim());
        }
        
        console.log('🔄 Creating thread with', allThreadContent.length, 'parts');
        
        // Create each chirp in the thread
        const threadId = Date.now().toString(); // Generate a simple thread ID
        const createdChirps = [];
        
        for (let i = 0; i < allThreadContent.length; i++) {
          const { data: chirp, error } = await supabase
            .from('chirps')
            .insert({
              content: allThreadContent[i],
              author_id: user.id,
              thread_id: threadId,
              thread_order: i,
              is_thread_starter: i === 0
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating thread chirp:', error);
            throw error;
          }
          
          createdChirps.push(chirp);
        }
        
        console.log('✅ Thread created with', createdChirps.length, 'chirps');
        
        setThreadChirps([]);
        setIsThreadMode(false);
      } else {
        // Post single chirp
        const { data: chirp, error } = await supabase
          .from('chirps')
          .insert({
            content: content.trim(),
            author_id: user.id
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
    if (remainingChars < 0) return '#ef4444'; // red
    if (remainingChars < 20) return '#f59e0b'; // yellow
    return '#6b7280'; // gray
  };

  const handleTextareaClick = () => {
    const currentRef = isThreadMode ? threadTextareaRef : textareaRef;
    if (currentRef.current) {
      currentRef.current.focus();
      // Also ensure the cursor is positioned at the end
      const length = currentRef.current.value.length;
      currentRef.current.setSelectionRange(length, length);
    }
  };

  if (isThreadMode) {
    // Thread mode - extend the compose field
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
          flexDirection: 'row',
          alignItems: 'flex-start'
        }}>
          <UserAvatar user={user} size="md" />
          
          <div style={{
            flex: 1,
            marginLeft: 8,
            overflow: 'hidden',
            cursor: 'text',
            position: 'relative',
            zIndex: 1
          }}
          onClick={handleTextareaClick}
          >
            <textarea
              ref={threadTextareaRef}
              style={{
                fontSize: 18,
                lineHeight: 24,
                minHeight: 30,
                maxHeight: 80,
                padding: 0,
                color: '#1a1a1a',
                width: '100%',
                resize: 'none',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                overflow: 'visible',
                cursor: 'text',
                fontFamily: 'inherit',
                position: 'relative',
                zIndex: 2
              }}
              placeholder="Start a thread..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
                handleTextareaClick();
              }}
              onFocus={() => {
                // Ensure cursor is at the end when focused
                setTimeout(() => {
                  if (threadTextareaRef.current) {
                    const length = threadTextareaRef.current.value.length;
                    threadTextareaRef.current.setSelectionRange(length, length);
                  }
                }, 0);
              }}
              maxLength={maxLength}
            />
            
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 12
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <button
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderRadius: 20,
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    marginRight: 12,
                    gap: 6,
                    cursor: 'pointer',
                    opacity: (!content.trim() || content.length > maxLength) ? 0.5 : 1
                  }}
                  onClick={addToThread}
                  disabled={!content.trim() || content.length > maxLength}
                >
                  <ThreadIcon size={16} color="#7c3aed" />
                  <span style={{
                    fontSize: 14,
                    color: '#7c3aed',
                    fontWeight: '600'
                  }}>Add</span>
                </button>
                
                <span style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: getCharCountColor()
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
                  opacity: ((threadChirps.length === 0 && !content.trim()) || isPosting) ? 0.5 : 1,
                  border: 'none'
                }}
                onClick={handleSubmit}
                disabled={(threadChirps.length === 0 && !content.trim()) || isPosting}
              >
                <span style={{
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  {isPosting ? "Posting..." : "Post all"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Thread List */}
        {threadChirps.length > 0 && (
          <div style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #e5e7eb'
          }}>
            {threadChirps.map((chirp, index) => (
              <div key={index} style={{
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                padding: 12,
                marginBottom: 8
              }}>
                <div style={{
                  flex: 1
                }}>
                  <p style={{
                    fontSize: 16,
                    lineHeight: 22,
                    color: '#1a1a1a',
                    marginBottom: 8
                  }}>{chirp}</p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 14,
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>Chirp {index + 1}</span>
                    <button
                      style={{
                        paddingLeft: 8,
                        paddingRight: 8,
                        paddingTop: 4,
                        paddingBottom: 4,
                        borderRadius: 12,
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        cursor: 'pointer'
                      }}
                      onClick={() => removeFromThread(index)}
                    >
                      <span style={{
                        fontSize: 12,
                        color: '#dc2626',
                        fontWeight: '500'
                      }}>Remove</span>
                    </button>
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
    <div style={{
      backgroundColor: '#ffffff',
      marginTop: 0,
      marginBottom: 3,
      borderRadius: 16,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start'
      }}>
        <UserAvatar user={user} size="md" />
        
        <div style={{
          flex: 1,
          marginLeft: 8,
          overflow: 'hidden',
          cursor: 'text',
          position: 'relative',
          zIndex: 1
        }}
        onClick={handleTextareaClick}
        >
          <textarea
            ref={textareaRef}
            style={{
              fontSize: 18,
              lineHeight: 24,
              minHeight: 30,
              maxHeight: 80,
              padding: 0,
              color: '#1a1a1a',
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              overflow: 'visible',
              cursor: 'text',
              fontFamily: 'inherit',
              position: 'relative',
              zIndex: 2
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
                />
                <button
                  style={{
                    position: 'absolute',
                    top: 8,
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
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderRadius: 20,
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  marginRight: 12,
                  gap: 6,
                  cursor: 'pointer'
                }}
                onClick={() => setIsThreadMode(true)}
              >
                <ThreadIcon size={16} color="#7c3aed" />
                <span style={{
                  fontSize: 14,
                  color: '#7c3aed',
                  fontWeight: '600'
                }}>Thread</span>
              </button>
              
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isThreadMode || isPosting}
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