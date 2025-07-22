import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface User {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  followersCount?: number;
  isFollowing?: boolean;
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchUsers = async (query?: string) => {
    try {
      const url = query ? `/api/users/search?q=${encodeURIComponent(query)}` : '/api/users';
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users. Please try again.');
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      setIsSearching(true);
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchUsers(text.trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      fetchUsers();
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ followingId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to follow/unfollow user.');
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Explore</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Discover new users</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ThemedView>

      <ScrollView style={styles.scrollView}>
        {(isLoading || isSearching) ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>
              {isSearching ? 'Searching...' : 'Loading users...'}
            </ThemedText>
          </ThemedView>
        ) : users.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              {searchQuery ? 'No users found' : 'No users yet'}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Start by creating an account to see other users!'}
            </ThemedText>
          </ThemedView>
        ) : (
          users.map((user) => (
            <ThemedView key={user.id} style={styles.userCard}>
              <ThemedView style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={styles.displayName}>
                  {user.displayName || user.username}
                </ThemedText>
                <ThemedText style={styles.username}>@{user.username}</ThemedText>
                {user.bio && (
                  <ThemedText style={styles.bio}>{user.bio}</ThemedText>
                )}
                {user.followersCount !== undefined && (
                  <ThemedText style={styles.followersCount}>
                    {user.followersCount} followers
                  </ThemedText>
                )}
              </ThemedView>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  user.isFollowing && styles.followingButton
                ]}
                onPress={() => handleFollow(user.id)}
              >
                <ThemedText style={[
                  styles.followButtonText,
                  user.isFollowing && styles.followingButtonText
                ]}>
                  {user.isFollowing ? 'Following' : 'Follow'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  displayName: {
    fontSize: 16,
    marginBottom: 2,
  },
  username: {
    color: '#1da1f2',
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  followersCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  followButton: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#e1e5e9',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#333',
  },
});