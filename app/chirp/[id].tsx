import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChirpCard from '../../components/ChirpCard';
import { getChirpById, getChirpReplies, getThreadedChirps } from '../../lib/database/mobile-db-supabase';
import { MobileChirp } from '../../lib/types/mobile-types';

export default function ChirpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [chirp, setChirp] = useState<MobileChirp | null>(null);
  const [replies, setReplies] = useState<MobileChirp[]>([]);
  const [threadedChirps, setThreadedChirps] = useState<MobileChirp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadChirpData();
    }
  }, [id]);

  const loadChirpData = async () => {
    try {
      setLoading(true);
      const chirpId = Array.isArray(id) ? id[0] : id;
      console.log('🔍 ChirpScreen: Loading chirp data for ID:', chirpId);
      console.log('🔍 ChirpScreen: ID type:', typeof chirpId, 'Value:', chirpId);
      
      // Load the main chirp
      const chirpData = await getChirpById(chirpId);
      console.log('📋 ChirpScreen: Retrieved chirp data:', chirpData ? 'success' : 'failed');
      setChirp(chirpData);
      
      // Load replies
      const repliesData = await getChirpReplies(chirpId);
      console.log('💬 ChirpScreen: Retrieved replies:', repliesData.length);
      setReplies(repliesData);
      
      // Check if this chirp is part of a thread or is a thread starter
      if (chirpData?.threadId) {
        // This chirp is part of a thread, load all threaded chirps
        console.log('🧵 ChirpScreen: Chirp has threadId:', chirpData.threadId);
        await loadThreadedChirps(chirpData.threadId);
      } else {
        console.log('🧵 ChirpScreen: Chirp has no threadId, not loading threaded chirps');
      }
    } catch (error) {
      console.error('❌ ChirpScreen: Error loading chirp:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshReplies = async () => {
    try {
      if (!id) return;
      const chirpId = Array.isArray(id) ? id[0] : id;
      console.log('🔄 ChirpScreen: Refreshing replies for chirp:', chirpId);
      
      const repliesData = await getChirpReplies(chirpId);
      console.log('💬 ChirpScreen: Refreshed replies:', repliesData.length);
      setReplies(repliesData);
    } catch (error) {
      console.error('❌ ChirpScreen: Error refreshing replies:', error);
    }
  };

  // Function to handle like count updates
  const handleLikeUpdate = useCallback((chirpId: string, newLikeCount: number) => {
    console.log('❤️ ChirpScreen: Like count updated for chirp:', chirpId, 'New count:', newLikeCount);
    
    // Update main chirp
    if (chirp && chirp.id === chirpId) {
      setChirp(prevChirp => ({
        ...prevChirp,
        reactionCount: newLikeCount,
        userHasLiked: newLikeCount > (prevChirp?.reactionCount || 0)
      }));
    }
    
    // Update threaded chirps
    setThreadedChirps(prevThreaded => 
      prevThreaded.map(threadChirp => 
        threadChirp.id === chirpId 
          ? { 
              ...threadChirp, 
              reactionCount: newLikeCount,
              userHasLiked: newLikeCount > (threadChirp.reactionCount || 0)
            }
          : threadChirp
      )
    );
    
    // Update replies
    setReplies(prevReplies => 
      prevReplies.map(reply => 
        reply.id === chirpId 
          ? { 
              ...reply, 
              reactionCount: newLikeCount,
              userHasLiked: newLikeCount > (reply.reactionCount || 0)
            }
          : reply
      )
    );
  }, [chirp]);

  const loadThreadedChirps = async (threadId: string) => {
    try {
      console.log('🧵 ChirpScreen: Loading threaded chirps for threadId:', threadId);
      // Use the proper getThreadedChirps function that orders by thread_order
      const threadData = await getThreadedChirps(threadId);
      console.log('🧵 ChirpScreen: Raw thread data:', threadData.length, 'chirps');
      
      // Filter out the main chirp to avoid duplication
      const mainChirpId = Array.isArray(id) ? id[0] : id;
      const filteredThreadData = threadData.filter(chirp => chirp.id !== mainChirpId);
      
      const threadedData = filteredThreadData.map(chirp => ({
        ...chirp,
        isThreadedChirp: true
      }));
      setThreadedChirps(threadedData);
      console.log('🧵 ChirpScreen: Loaded threaded chirps (excluding main):', threadedData.length);
    } catch (error) {
      console.error('❌ ChirpScreen: Error loading threaded chirps:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chirp</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading chirp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chirp) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chirp</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chirp not found</Text>
          <Text style={styles.errorSubtext}>This chirp may have been deleted or doesn't exist</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chirp</Text>
      </View>

      {/* Chirp Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Chirp */}
        <ChirpCard 
          chirp={chirp} 
          onReplyPress={() => {}} 
          onSharePress={() => {}} 
          onMorePress={() => {}} 
          onReplyPosted={() => refreshReplies()}
          onProfilePress={(userId) => router.push(`/profile/${userId}`)}
          onLikeUpdate={handleLikeUpdate}
        />
        
        {/* Threaded Chirps - Directly below main chirp */}
        {threadedChirps.length > 0 && (
          <View style={styles.threadedSection}>
            {threadedChirps
              .filter(threadChirp => threadChirp.id !== chirp?.id) // Filter out the main chirp to avoid duplicates
              .map((threadChirp) => (
              <View key={threadChirp.id} style={styles.threadedChirpContainer}>
                <ChirpCard 
                  chirp={threadChirp} 
                  onReplyPress={() => {}} 
                  onSharePress={() => {}} 
                  onMorePress={() => {}} 
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                  onLikeUpdate={handleLikeUpdate}
                />
              </View>
            ))}
          </View>
        )}
        
        {/* Replies Section - Separated from main chirp */}
        {replies.length > 0 && (
          <View style={styles.repliesSection}>
            <Text style={styles.repliesHeader}>Replies</Text>
            {replies.map((reply) => (
              <ChirpCard 
                key={reply.id} 
                chirp={reply} 
                onReplyPress={() => {}} 
                onSharePress={() => {}} 
                onMorePress={() => {}} 
                onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#14171a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#657786',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  repliesSection: {
    marginTop: 8,
  },
  repliesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  threadedSection: {
    marginTop: 0,
  },
  threadedChirpContainer: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
});