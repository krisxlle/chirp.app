import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChirpCard from '../../components/ChirpCard';
import { getChirpsByHashtag } from '../../mobile-db';
import type { MobileChirp } from '../../mobile-types';

export default function HashtagPage() {
  const params = useLocalSearchParams();
  const hashtag = Array.isArray(params.hashtag) ? params.hashtag[0] : params.hashtag;
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hashtag) {
      fetchHashtagChirps();
    }
  }, [hashtag]);

  const fetchHashtagChirps = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching chirps for hashtag:', hashtag);
      
      const hashtagChirps = await getChirpsByHashtag(hashtag);
      setChirps(hashtagChirps);
      
      if (hashtagChirps.length === 0) {
        setError(`No chirps found for ${hashtag}`);
      }
    } catch (err) {
      console.error('Error fetching hashtag chirps:', err);
      setError('Failed to load chirps for this hashtag');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const displayHashtag = hashtag?.startsWith('#') ? hashtag : `#${hashtag}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#7c3aed" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.hashtagTitle}>{displayHashtag}</Text>
          <Text style={styles.chirpCount}>
            {loading ? 'Loading...' : `${chirps.length} chirp${chirps.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading chirps...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHashtagChirps}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : chirps.length > 0 ? (
          <View style={styles.chirpsContainer}>
            {chirps.map((chirp, index) => (
              <View key={chirp.id} style={[styles.chirpWrapper, index > 0 && styles.chirpBorder]}>
                <ChirpCard 
                  chirp={chirp} 
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No chirps found</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to chirp about {displayHashtag}!
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Account for status bar
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  hashtagTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  chirpCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chirpsContainer: {
    paddingVertical: 8,
  },
  chirpWrapper: {
    backgroundColor: '#ffffff',
  },
  chirpBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});