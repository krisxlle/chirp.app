import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfilePage() {
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
      content: 'The beauty of anonymity is that it lets your ideas speak for themselves, not your identity.',
      timestamp: '3 days ago',
      likes: 45,
      replies: 12,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header - exactly like original */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.username.substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{user.displayName}</Text>
              <Text style={styles.username}>@{user.username}</Text>
            </View>
          </View>
          
          <Text style={styles.bio}>{user.bio}</Text>
          
          <View style={styles.joinInfo}>
            <Text style={styles.joinText}>📅 Joined {user.joinedDate}</Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.chirpsCount}</Text>
              <Text style={styles.statLabel}>Chirps</Text>
            </View>
          </View>
        </View>

        {/* Tabs - like original */}
        <View style={styles.tabsContainer}>
          {(['chirps', 'replies', 'media'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'chirps' && (
          <View style={styles.chirpsSection}>
            {userChirps.map((chirp) => (
              <View key={chirp.id} style={styles.chirpCard}>
                <Text style={styles.chirpContent}>{chirp.content}</Text>
                <View style={styles.chirpFooter}>
                  <Text style={styles.timestamp}>{chirp.timestamp}</Text>
                  <View style={styles.chirpStats}>
                    <Text style={styles.chirpStat}>💬 {chirp.replies}</Text>
                    <Text style={styles.chirpStat}>❤️ {chirp.likes}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'replies' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No replies yet</Text>
            <Text style={styles.emptySubtext}>Your replies to other chirps will appear here</Text>
          </View>
        )}

        {activeTab === 'media' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyTitle}>No media yet</Text>
            <Text style={styles.emptySubtext}>Photos and videos you share will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  profileHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#657786',
  },
  bio: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  joinInfo: {
    marginBottom: 16,
  },
  joinText: {
    fontSize: 14,
    color: '#657786',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#657786',
    marginTop: 2,
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#657786',
  },
  activeTabText: {
    color: '#7c3aed',
  },
  chirpsSection: {
    backgroundColor: '#ffffff',
  },
  chirpCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  chirpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
    color: '#657786',
  },
  chirpStats: {
    flexDirection: 'row',
    gap: 16,
  },
  chirpStat: {
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
});