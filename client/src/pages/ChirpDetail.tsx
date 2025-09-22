import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import ChirpCard from "../components/ChirpCard";
import { useState, useEffect } from "react";

export default function ChirpDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [chirp, setChirp] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chirp and replies using Supabase
  useEffect(() => {
    const fetchChirpData = async () => {
      if (!id) return;
      
      try {
        console.log('🔍 Fetching chirp details for ID:', id);
        
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

        // Fetch the main chirp
        const { data: chirpData, error: chirpError } = await supabase
          .from('chirps')
          .select(`
            id,
            content,
            created_at,
            reply_to_id,
            author:users!chirps_author_id_fkey (
              id,
              first_name,
              last_name,
              email,
              handle,
              custom_handle,
              profile_image_url,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (chirpError) {
          console.error('❌ Error fetching chirp:', chirpError);
          setIsLoading(false);
          return;
        }

        if (chirpData) {
          // Transform the chirp data to match expected format
          const transformedChirp = {
            id: chirpData.id,
            content: chirpData.content,
            createdAt: chirpData.created_at,
            replyToId: chirpData.reply_to_id,
            author: {
              id: chirpData.author.id,
              firstName: chirpData.author.first_name,
              lastName: chirpData.author.last_name,
              email: chirpData.author.email,
              handle: chirpData.author.handle,
              customHandle: chirpData.author.custom_handle,
              profileImageUrl: chirpData.author.profile_image_url,
              avatarUrl: chirpData.author.avatar_url,
              isChirpPlus: false,
              showChirpPlusBadge: false
            },
            replyCount: 0, // Will be updated below
            reactionCount: 0, // Default value
            userHasLiked: false, // Default value
            isWeeklySummary: false,
            imageUrl: null,
            imageAltText: null,
            imageWidth: null,
            imageHeight: null,
            isDirectReply: false,
            isNestedReply: false,
            isThreadedChirp: false
          };

          setChirp(transformedChirp);

          // Fetch replies to this chirp
          const { data: repliesData, error: repliesError } = await supabase
            .from('chirps')
            .select(`
              id,
              content,
              created_at,
              reply_to_id,
              author:users!chirps_author_id_fkey (
                id,
                first_name,
                last_name,
                email,
                handle,
                custom_handle,
                profile_image_url,
                avatar_url
              )
            `)
            .eq('reply_to_id', id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('❌ Error fetching replies:', repliesError);
          } else if (repliesData) {
            // Transform replies data
            const transformedReplies = repliesData.map(reply => ({
              id: reply.id,
              content: reply.content,
              createdAt: reply.created_at,
              replyToId: reply.reply_to_id,
              author: {
                id: reply.author.id,
                firstName: reply.author.first_name,
                lastName: reply.author.last_name,
                email: reply.author.email,
                handle: reply.author.handle,
                customHandle: reply.author.custom_handle,
                profileImageUrl: reply.author.profile_image_url,
                avatarUrl: reply.author.avatar_url,
                isChirpPlus: false,
                showChirpPlusBadge: false
              },
              replyCount: 0,
              reactionCount: 0,
              userHasLiked: false,
              isWeeklySummary: false,
              imageUrl: null,
              imageAltText: null,
              imageWidth: null,
              imageHeight: null,
              isDirectReply: true,
              isNestedReply: false,
              isThreadedChirp: false
            }));

            setReplies(transformedReplies);
            
            // Update the main chirp's reply count
            setChirp(prev => ({
              ...prev,
              replyCount: transformedReplies.length
            }));
          }

          console.log('✅ Chirp details loaded:', transformedChirp.content.substring(0, 50) + '...');
          console.log('✅ Replies loaded:', repliesData?.length || 0);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error in fetchChirpData:', error);
        setIsLoading(false);
      }
    };

    fetchChirpData();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setLocation("/")}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              margin: 0
            }}>Chirp</h1>
          </div>
        </header>

        <main style={{
          paddingBottom: '80px',
          flex: 1
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb'
                }}></div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{
                    height: '16px',
                    width: '128px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px'
                  }}></div>
                  <div style={{
                    height: '16px',
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px'
                  }}></div>
                  <div style={{
                    height: '16px',
                    width: '75%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!chirp) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setLocation("/")}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              margin: 0
            }}>Chirp</h1>
          </div>
        </header>

        <main style={{
          paddingBottom: '80px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '32px'
          }}>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0
            }}>Chirp not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setLocation("/")}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
          }}>Thread</h1>
        </div>
      </header>

      <main style={{
        paddingBottom: '80px',
        flex: 1
      }}>
        {/* Main chirp */}
        <div style={{
          backgroundColor: '#ffffff'
        }}>
          <ChirpCard chirp={chirp} />
        </div>

        {/* Replies */}
        {isLoading ? (
          <div style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb'
                  }}></div>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{
                      height: '16px',
                      width: '128px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px'
                    }}></div>
                    <div style={{
                      height: '16px',
                      width: '100%',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px'
                    }}></div>
                    <div style={{
                      height: '16px',
                      width: '75%',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : replies.length > 0 ? (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              margin: 0
            }}>
              Replies ({replies.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}>
              {replies.map((reply: any, index: number) => (
                <div key={reply.id} style={{
                  borderTop: index > 0 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <ChirpCard chirp={reply} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px'
          }}>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0
            }}>No replies yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
