import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getTrendingHashtags, searchChirps, searchUsers } from '../mobile-db';
import ChirpCard from './ChirpCard';
import UserAvatar from './UserAvatar';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'trending' | 'chirps' | 'users'>('trending');
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      const hashtags = await getTrendingHashtags();
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
        const results = await searchChirps(query);
        setSearchResults(results);
      } else if (activeTab === 'users') {
        const results = await searchUsers(query);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Unable to perform search. Please try again.');
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
    router.push(`/profile/${user.id}`);
  };

  const handleHashtagPress = (hashtag: string) => {
    console.log('Hashtag pressed:', hashtag);
    const cleanHashtag = hashtag.replace('#', '');
    router.push(`/hashtag/${cleanHashtag}`);
  };

  return (
    <View style={styles.container}>
      {/* Header - exactly like original */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#657786"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>
      </View>

      {/* Tabs - like original */}
      <View style={styles.tabsContainer}>
        {(['trending', 'chirps', 'users'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <View style={styles.tabContent}>
              {activeTab === tab ? (
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTab}
                >
                  <Text style={styles.activeTabText}>
                    {tab === 'trending' ? 'Trending' : tab === 'chirps' ? 'Chirps' : 'Users'}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.tabText}>
                    {tab === 'trending' ? 'Trending' : tab === 'chirps' ? 'Chirps' : 'Users'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'trending' && (
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            {trendingTopics.map((topic, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.trendingItem}
                onPress={() => {
                  // Navigate to hashtag page
                  const cleanHashtag = topic.hashtag.replace('#', '');
                  router.push(`/hashtag/${cleanHashtag}`);
                }}
              >
                <Text style={styles.hashtag}>{topic.hashtag}</Text>
                <Text style={styles.trendingCount}>{topic.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'chirps' && (
          <View style={styles.searchSection}>
            {isLoading && (
              <Text style={styles.loadingText}>Searching chirps...</Text>
            )}
            {searchResults.length > 0 ? (
              searchResults.map((chirp) => (
                <ChirpCard 
                  key={chirp.id} 
                  chirp={chirp} 
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                />
              ))
            ) : query.trim() && !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No chirps found</Text>
                <Text style={styles.emptySubtext}>Try different keywords</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Search for chirps</Text>
                <Text style={styles.emptySubtext}>Enter keywords to find chirps</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.searchSection}>
            {isLoading && (
              <Text style={styles.loadingText}>Searching users...</Text>
            )}
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={styles.userItem}
                  onPress={() => handleUserPress(user)}
                >
                  <UserAvatar user={user} size="md" />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.userHandle}>@{user.customHandle || user.handle}</Text>
                    {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
                  </View>
                </TouchableOpacity>
              ))
            ) : query.trim() && !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySubtext}>Try different search terms</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyTitle}>Search for users</Text>
                <Text style={styles.emptySubtext}>Find people to follow</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Feedback Button */}
      <TouchableOpacity 
        style={styles.feedbackButtonContainer}
        onPress={() => router.push('/feedback')}
      >
        <LinearGradient
          colors={['#7c3aed', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.feedbackButton}
        >
          <Text style={styles.feedbackButtonText}>Feedback</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#f7f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 52,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    minHeight: 32,
  },
  inactiveTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#657786',
    textAlign: 'center',
    lineHeight: 20,
  },
  activeTabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  trendingSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  trendingItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  hashtag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  trendingCount: {
    fontSize: 14,
    color: '#657786',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    paddingVertical: 20,
  },
  userItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#d946ef',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 18,
  },
  feedbackButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});