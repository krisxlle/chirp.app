import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function ProfileScreen() {
  const [user] = useState({
    username: 'anonymous_user',
    displayName: 'Anonymous User',
    bio: 'Privacy-focused social media enthusiast. Building connections while staying anonymous. 🎭',
    followersCount: 247,
    followingCount: 183,
    chirpsCount: 52,
    joinedDate: 'March 2024',
  });

  const [activeTab, setActiveTab] = useState<'chirps' | 'replies' | 'media'>('chirps');

  const userChirps = [
    {
      id: '1',
      content: 'Love how this platform lets me express myself freely without compromising my privacy! 🔒',
      timestamp: '2 hours ago',
      likes: 12,
      replies: 3,
    },
    {
      id: '2',
      content: 'Just discovered some amazing privacy tools. Anonymous social media is the future! #privacy #tech',
      timestamp: '1 day ago',
      likes: 28,
      replies: 7,
    },
    {
      id: '3',
      content: 'Morning thoughts: True freedom comes when you can be yourself without fear of judgment. 🌅',
      timestamp: '2 days ago',
      likes: 45,
      replies: 12,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatarContainer}>
            <ThemedView style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user.displayName.substring(0, 1).toUpperCase()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.userInfo}>
            <ThemedText type="title" style={styles.displayName}>
              {user.displayName}
            </ThemedText>
            <ThemedText style={styles.username}>@{user.username}</ThemedText>
            <ThemedText style={styles.bio}>{user.bio}</ThemedText>
            <ThemedText style={styles.joinedDate}>Joined {user.joinedDate}</ThemedText>
          </ThemedView>

          {/* Stats */}
          <ThemedView style={styles.stats}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.chirpsCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Chirps</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followingCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Following</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followersCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Followers</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Tabs */}
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'chirps' && styles.activeTab]}
            onPress={() => setActiveTab('chirps')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'chirps' && styles.activeTabText]}>
              Chirps
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'replies' && styles.activeTab]}
            onPress={() => setActiveTab('replies')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'replies' && styles.activeTabText]}>
              Replies
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'media' && styles.activeTab]}
            onPress={() => setActiveTab('media')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>
              Media
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Content */}
        <ThemedView style={styles.content}>
          {activeTab === 'chirps' && (
            <>
              {userChirps.map((chirp) => (
                <ThemedView key={chirp.id} style={styles.chirpCard}>
                  <ThemedText style={styles.chirpContent}>{chirp.content}</ThemedText>
                  <ThemedText style={styles.chirpTimestamp}>{chirp.timestamp}</ThemedText>
                  
                  <ThemedView style={styles.chirpActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <ThemedText>💬 {chirp.replies}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <ThemedText>❤️ {chirp.likes}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <ThemedText>🔄 Share</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              ))}
            </>
          )}

          {activeTab === 'replies' && (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No replies yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Your replies to other chirps will appear here
              </ThemedText>
            </ThemedView>
          )}

          {activeTab === 'media' && (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No media yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Photos and videos you share will appear here
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1da1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  joinedDate: {
    fontSize: 12,
    color: '#657786',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#657786',
  },
  editButton: {
    backgroundColor: '#1da1f2',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1da1f2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#657786',
  },
  activeTabText: {
    color: '#1da1f2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  chirpCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8,
  },
  chirpTimestamp: {
    fontSize: 12,
    color: '#657786',
    marginBottom: 12,
  },
  chirpActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptySubtext: {
    color: '#657786',
    marginTop: 8,
    textAlign: 'center',
  },
});