import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followersCount: number;
  isFollowing: boolean;
}

interface HashTag {
  tag: string;
  count: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingTags, setTrendingTags] = useState<HashTag[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSearchData = async () => {
    try {
      console.log('Fetching search data...');
      
      // Try to connect to actual backend API first
      try {
        const usersResponse = await fetch('/api/users', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const tagsResponse = await fetch('/api/trending/hashtags', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (usersResponse.ok && tagsResponse.ok) {
          const backendUsers = await usersResponse.json();
          const backendTags = await tagsResponse.json();
          setSuggestedUsers(backendUsers);
          setTrendingTags(backendTags);
          return;
        }
      } catch (backendError) {
        console.log('Backend API not available, using sample data');
      }
      
      // Fallback sample data when backend is not available
      const sampleUsers: User[] = [
        { id: '1', username: 'techfan', displayName: 'Tech Enthusiast', bio: 'Love discussing emerging technologies 🚀', followersCount: 234, isFollowing: false },
        { id: '2', username: 'artlover', displayName: 'Creative Mind', bio: 'Digital artist exploring anonymous expression', followersCount: 156, isFollowing: false },
        { id: '3', username: 'privacyadvocate', displayName: 'Privacy First', bio: 'Fighting for digital rights and privacy 🔐', followersCount: 892, isFollowing: false },
        { id: '4', username: 'musicvibes', displayName: 'Music Lover', bio: 'Sharing anonymous music discoveries', followersCount: 445, isFollowing: true },
      ];

      const sampleTags: HashTag[] = [
        { tag: 'privacy', count: 1247 },
        { tag: 'technology', count: 892 },
        { tag: 'anonymous', count: 567 },
        { tag: 'social', count: 423 },
        { tag: 'ai', count: 289 },
        { tag: 'crypto', count: 234 },
      ];

      setSuggestedUsers(sampleUsers);
      setTrendingTags(sampleTags);
    } catch (error) {
      console.error('Failed to fetch search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Filter suggested users based on search query
    const filtered = suggestedUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.bio.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  useEffect(() => {
    fetchSearchData();
  }, []);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, suggestedUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSearchData();
    setRefreshing(false);
  };

  const toggleFollow = (userId: string) => {
    setSuggestedUsers(users => 
      users.map(user => 
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
    setSearchResults(results => 
      results.map(user => 
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
  };

  const UserCard = ({ user }: { user: User }) => (
    <View style={styles.userCard}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={32} color="#9ca3af" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
        <Text style={styles.followersCount}>{user.followersCount} followers</Text>
      </View>
      <TouchableOpacity
        style={[styles.followButton, user.isFollowing && styles.followingButton]}
        onPress={() => toggleFollow(user.id)}
      >
        <Text style={[styles.followButtonText, user.isFollowing && styles.followingButtonText]}>
          {user.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchQuery ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.length === 0 ? (
            <Text style={styles.emptyText}>No users found matching "{searchQuery}"</Text>
          ) : (
            searchResults.map(user => <UserCard key={user.id} user={user} />)
          )}
        </View>
      ) : (
        <>
          {/* Trending Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              {trendingTags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag.tag}</Text>
                  <Text style={styles.tagCount}>{tag.count}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Suggested Users */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>People You Might Like</Text>
            {suggestedUsers.map(user => <UserCard key={user.id} user={user} />)}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  searchHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
  tagsContainer: {
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
  tagCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  followersCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#9333ea',
  },
  followingButton: {
    backgroundColor: '#e5e7eb',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  followingButtonText: {
    color: '#6b7280',
  },
});