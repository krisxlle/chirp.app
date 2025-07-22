import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { getChirpsFromDB } from '../mobile-db';
import type { MobileChirp } from '../mobile-types';

interface ChirpCardProps {
  chirp: MobileChirp;
}

const ChirpCard: React.FC<ChirpCardProps> = ({ chirp }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <View style={[styles.chirpCard, chirp.isWeeklySummary && styles.weeklySummaryCard]}>
      <View style={styles.chirpHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {chirp.username.substring(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.chirpMeta}>
          <Text style={styles.username}>@{chirp.username}</Text>
          <Text style={styles.timestamp}>• {formatDate(chirp.createdAt)}</Text>
        </View>
        {chirp.isWeeklySummary && (
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>Weekly Summary</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.chirpContent}>{chirp.content}</Text>
      
      <View style={styles.chirpActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>💬 Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>🔄 Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>❤️ {chirp.reactions?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ComposeChirp: React.FC<{ onPost: () => void }> = ({ onPost }) => {
  const [content, setContent] = useState('');
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  const handlePost = () => {
    if (content.trim()) {
      Alert.alert('Success', 'Your chirp has been posted!');
      setContent('');
      onPost();
    }
  };

  return (
    <View style={styles.composeSection}>
      <View style={styles.composeHeader}>
        <View style={styles.composeAvatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <View style={styles.composeContainer}>
          <TextInput
            style={styles.composeInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#657786"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={maxLength}
          />
          <View style={styles.composeActions}>
            <Text style={[styles.characterCount, remainingChars < 20 && styles.characterCountWarning]}>
              {remainingChars}
            </Text>
            <TouchableOpacity 
              style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={!content.trim()}
            >
              <Text style={styles.postButtonText}>Chirp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ChirpApp() {
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState<'personalized' | 'chronological' | 'trending'>('personalized');

  const fetchChirps = async () => {
    try {
      console.log('Fetching authentic user chirps from database...');
      const data = await getChirpsFromDB();
      console.log('Successfully loaded authentic chirps:', data.length);
      setChirps(data);
    } catch (error) {
      console.error('Database connection failed:', error);
      Alert.alert('Connection Error', 'Unable to load your chirps. Please check your internet connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChirps();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChirps();
  };

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'personalized': return '✨';
      case 'chronological': return '🕐';
      case 'trending': return '📈';
      default: return '✨';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your authentic chirps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🐦 Chirp</Text>
          </View>
          <View style={styles.feedControls}>
            {(['personalized', 'chronological', 'trending'] as const).map((type) => (
              <TouchableOpacity 
                key={type}
                style={[styles.feedButton, feedType === type && styles.activeFeedButton]}
                onPress={() => setFeedType(type)}
              >
                <Text style={[styles.feedButtonText, feedType === type && styles.activeFeedButtonText]}>
                  {getFeedIcon(type)} {type === 'personalized' ? 'For You' : type === 'chronological' ? 'Recent' : 'Trending'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ComposeChirp onPost={fetchChirps} />
        
        {chirps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No chirps yet</Text>
            <Text style={styles.emptySubtext}>Start by posting your first chirp above!</Text>
          </View>
        ) : (
          chirps.map((chirp) => (
            <ChirpCard key={chirp.id} chirp={chirp} />
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'column',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  feedControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  feedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  activeFeedButton: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  feedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657786',
  },
  activeFeedButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  composeSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 8,
    borderBottomColor: '#f7f9fa',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  composeHeader: {
    flexDirection: 'row',
  },
  composeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  composeContainer: {
    flex: 1,
  },
  composeInput: {
    fontSize: 18,
    lineHeight: 24,
    minHeight: 80,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    color: '#1a1a1a',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  characterCount: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '500',
  },
  characterCountWarning: {
    color: '#f91880',
  },
  postButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#e1e8ed',
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  chirpCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  weeklySummaryCard: {
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  chirpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  chirpMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 15,
    color: '#657786',
    marginLeft: 4,
  },
  summaryBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chirpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '500',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
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