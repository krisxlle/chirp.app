import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChirpCard } from '../../components/ChirpCard';
import { getChirpById, getChirpReplies } from '../../mobile-db';
import { MobileChirp } from '../../mobile-types';

export default function ChirpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [chirp, setChirp] = useState<MobileChirp | null>(null);
  const [replies, setReplies] = useState<MobileChirp[]>([]);
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
      
      // Load the main chirp
      const chirpData = await getChirpById(chirpId);
      setChirp(chirpData);
      
      // Load replies
      const repliesData = await getChirpReplies(chirpId);
      setReplies(repliesData);
    } catch (error) {
      console.error('Error loading chirp:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  if (!chirp) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chirp</Text>
      </View>

      {/* Chirp Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ChirpCard 
          chirp={chirp} 
          onReplyPress={() => {}} 
          onSharePress={() => {}} 
          onMorePress={() => {}} 
        />
        
        {/* Replies Section */}
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
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingVertical: 16,
    paddingTop: 20,
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
});