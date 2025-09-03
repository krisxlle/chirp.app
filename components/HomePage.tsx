import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Use API instead of direct database connection
import { useResponsive } from '../hooks/useResponsive';
import type { MobileChirp } from '../mobile-types';
import { useAuth } from './AuthContext';
import ChirpCard from './ChirpCard';
import ComposeChirp from './ComposeChirp';
import ProfileModal from './ProfileModal';

// Mock data for when API is not available
const createMockChirps = () => [
  {
    id: '1',
    content: 'Welcome to Chirp! This is a test chirp to get you started. 🐦✨',
    createdAt: new Date().toISOString(),
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
    },
    replyCount: 0,
    reactionCount: 5,
    reactions: [],
    isWeeklySummary: false,
  },
  {
    id: '2',
    content: 'Testing the app with authentication disabled. Everything should work smoothly now! 🚀',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
    },
    replyCount: 2,
    reactionCount: 12,
    reactions: [],
    isWeeklySummary: false,
  },
  {
    id: '3',
    content: 'The white screen issue should be resolved now. Let me know if you see this chirp! 👀',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
    },
    replyCount: 1,
    reactionCount: 8,
    reactions: [],
    isWeeklySummary: false,
  }
];

// Convert mobile chirps to ChirpCard format
const convertToChirpCard = (chirp: MobileChirp) => ({
  id: chirp.id,
  content: chirp.content,
  createdAt: chirp.createdAt,
  isWeeklySummary: chirp.isWeeklySummary || false,
  author: {
    id: chirp.author.id || 'anonymous',
    firstName: chirp.author.firstName || '',
    lastName: chirp.author.lastName || chirp.author.firstName || '',
    email: chirp.author.email || 'anonymous@example.com',
    handle: chirp.author.handle || 'anonymous',
    customHandle: chirp.author.customHandle || 'anonymous',
    profileImageUrl: chirp.author.profileImageUrl || undefined,
  },
  replyCount: chirp.replyCount || 0,
  reactionCount: chirp.reactionCount || 0,
  reactionCounts: chirp.reactions?.reduce((acc: any, reaction: any) => {
    acc[reaction.emoji] = reaction.count;
    return acc;
  }, {}) || {},
  replies: [],
});

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { padding, spacing } = useResponsive();
  
  // State for feed type
  const [feedType, setFeedType] = useState<'forYou' | 'collection'>('forYou');
  
  // State for chirps - start with mock data
  const [forYouChirps, setForYouChirps] = useState(createMockChirps());
  const [collectionChirps, setCollectionChirps] = useState([
    {
      id: '4',
      content: 'Just pulled a rare character from the gacha! 🎉✨',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      author: {
        id: 'gacha-user-1',
        firstName: 'Gacha',
        lastName: 'Player',
        email: 'gacha@example.com',
        customHandle: 'gachamaster',
        handle: 'gachamaster',
        profileImageUrl: undefined,
      },
      replyCount: 3,
      reactionCount: 15,
      reactions: [],
      isWeeklySummary: false,
    },
    {
      id: '5',
      content: 'Finally completed my collection! This took forever but totally worth it 🏆',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      author: {
        id: 'gacha-user-2',
        firstName: 'Collection',
        lastName: 'Hunter',
        email: 'hunter@example.com',
        customHandle: 'hunter',
        handle: 'hunter',
        profileImageUrl: undefined,
      },
      replyCount: 8,
      reactionCount: 25,
      reactions: [],
      isWeeklySummary: false,
    }
  ]);
  
  // Function to update chirp like count
  const handleChirpLikeUpdate = (chirpId: string, newLikeCount: number) => {
    setForYouChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, reactionCount: newLikeCount }
          : chirp
      )
    );
    
    setCollectionChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, reactionCount: newLikeCount }
          : chirp
      )
    );
  };
  // Function to add a new chirp to the For You feed
  const handleNewChirp = (content: string) => {
    const newChirp = {
      id: `chirp-${Date.now()}`, // Generate unique ID
      content: content,
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id || 'current-user',
        firstName: user?.firstName || 'Current',
        lastName: user?.lastName || 'User',
        email: user?.email || 'current@example.com',
        customHandle: user?.customHandle || 'currentuser',
        handle: user?.handle || 'currentuser',
        profileImageUrl: undefined, // Keep consistent with mock data type
      },
      replyCount: 0,
      reactionCount: 0,
      reactions: [],
      isWeeklySummary: false,
    };
    
    // Add the new chirp to the beginning of the For You feed
    setForYouChirps(prevChirps => [newChirp, ...prevChirps]);
    console.log('New chirp added to For You feed:', newChirp);
  };
  
  // Get current chirps based on feed type
  const currentChirps = feedType === 'forYou' ? forYouChirps : collectionChirps;
  
  // Safety check - if user is not available, show a loading state
  if (!user) {
    console.log('HomePage: User not available, showing loading state');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  console.log('HomePage: User available, rendering full component - user ID:', user.id);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: padding.header.horizontal, paddingVertical: padding.header.vertical }]}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Chirp</Text>
            </View>
            
            <View style={styles.feedControls}>
              <TouchableOpacity 
                style={[styles.feedButton, feedType === 'forYou' && styles.activeFeedButton]}
                onPress={() => setFeedType('forYou')}
              >
                <Text style={feedType === 'forYou' ? styles.activeFeedButtonText : styles.feedButtonText}>
                  For You
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.feedButton, feedType === 'collection' && styles.activeFeedButton]}
                onPress={() => setFeedType('collection')}
              >
                <Text style={feedType === 'collection' ? styles.activeFeedButtonText : styles.feedButtonText}>
                  Collection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={[styles.content, { paddingHorizontal: padding.content.horizontal }]}>
          <View style={[styles.composeContainer, { paddingTop: spacing.lg, paddingBottom: spacing.md }]}>
            <ComposeChirp onPost={handleNewChirp} />
          </View>
          
                                {currentChirps.map((chirp) => (
                        <ChirpCard 
                          key={chirp.id} 
                          chirp={convertToChirpCard(chirp)} 
                          onDeleteSuccess={() => console.log('Chirp deleted')}
                          onProfilePress={(userId) => console.log('Profile pressed:', userId)}
                          onLikeUpdate={handleChirpLikeUpdate}
                        />
                      ))}
        </ScrollView>

        <ProfileModal
          visible={false}
          userId={null}
          onClose={() => console.log('Profile modal closed')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  content: {
    flex: 1,
  },
  composeContainer: {
    // Padding will be applied dynamically
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
  feedControls: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 2,
  },
  feedButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  activeFeedButton: {
    backgroundColor: '#7c3aed',
  },
  activeFeedButtonText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  feedButtonText: {
    color: '#657786',
  },
});