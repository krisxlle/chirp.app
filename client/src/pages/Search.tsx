import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '../components/api';
import ChirpCard from '../components/ChirpCard';
import UserAvatar from '../components/UserAvatar';

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'trending' | 'chirps' | 'users'>('trending');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      // For now, use mock trending hashtags
      // In a real implementation, this would come from an API
      const hashtags = ['#trending', '#viral', '#popular', '#news', '#tech'];
      setTrendingTopics(hashtags);
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 'chirps') {
        const results = await apiRequest(`/api/search/chirps?q=${encodeURIComponent(query)}`);
        setSearchResults(results || []);
      } else if (activeTab === 'users') {
        const results = await apiRequest(`/api/search/users?q=${encodeURIComponent(query)}`);
        setSearchResults(results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to empty results for now
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() && activeTab !== 'trending') {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query, activeTab]);

  const handleUserPress = (user: any) => {
    setLocation(`/profile/${user.id}`);
  };

  const handleHashtagPress = (hashtag: string) => {
    console.log('Hashtag pressed:', hashtag);
    const cleanHashtag = hashtag.replace('#', '');
    setLocation(`/hashtag/${cleanHashtag}`);
  };

  const handleBackPress = () => {
    setLocation('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16
      }}>
        {/* Header with back button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 24,
              color: '#657786',
              cursor: 'pointer',
              padding: 8,
              marginRight: 12
            }}
            onClick={handleBackPress}
          >
            ←
          </button>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <input
              type="text"
              style={{
                width: '100%',
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 16,
                paddingRight: 16,
                fontSize: 16,
                border: '1px solid #d1d5db',
                borderRadius: 20,
                backgroundColor: '#f8fafc',
                outline: 'none',
                color: '#1a1a1a'
              }}
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {(['trending', 'chirps', 'users'] as const).map((tab) => (
            <button
              key={tab}
              style={{
                flex: 1,
                paddingTop: 12,
                paddingBottom: 12,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                color: activeTab === tab ? '#7c3aed' : '#657786',
                fontSize: 16,
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 16,
        paddingBottom: 16
      }}>
        {activeTab === 'trending' && (
          <div>
            <h3 style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: 16
            }}>
              Trending Topics
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {trendingTopics.map((hashtag, index) => (
                <div
                  key={index}
                  style={{
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 16,
                    paddingRight: 16,
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleHashtagPress(hashtag)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#7c3aed'
                  }}>
                    {hashtag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chirps' && (
          <div>
            {isLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  Searching chirps...
                </span>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: 16
                }}>
                  Search Results
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  {searchResults.map((chirp) => (
                    <ChirpCard
                      key={chirp.id}
                      chirp={chirp}
                      onProfilePress={() => handleUserPress(chirp.author)}
                    />
                  ))}
                </div>
              </div>
            ) : query.trim() ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  No chirps found for "{query}"
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  Enter a search term to find chirps
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            {isLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  Searching users...
                </span>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: 16
                }}>
                  Search Results
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: 12,
                        paddingBottom: 12,
                        paddingLeft: 16,
                        paddingRight: 16,
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => handleUserPress(user)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <UserAvatar user={user} size="md" />
                      <div style={{
                        marginLeft: 12,
                        flex: 1
                      }}>
                        <div style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#1a1a1a',
                          marginBottom: 2
                        }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{
                          fontSize: 14,
                          color: '#657786'
                        }}>
                          @{user.customHandle || user.handle || 'user'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : query.trim() ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  No users found for "{query}"
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 32,
                paddingBottom: 32
              }}>
                <span style={{
                  fontSize: 16,
                  color: '#657786'
                }}>
                  Enter a search term to find users
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}