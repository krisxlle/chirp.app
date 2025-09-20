import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import UserAvatar from './UserAvatar';

// Direct import approach
import * as dbModule from '../lib/database/mobile-db-supabase';

interface ChirpLikesModalProps {
  visible: boolean;
  chirpId: string;
  onClose: () => void;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  customHandle: string;
  handle: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  likedAt: string;
}

export default function ChirpLikesModal({ visible, chirpId, onClose }: ChirpLikesModalProps) {
  const [likes, setLikes] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && chirpId) {
      loadLikes();
    }
  }, [visible, chirpId]);

  const loadLikes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading likes for chirp:', chirpId);
      console.log('🔄 getChirpLikes function:', typeof dbModule.getChirpLikes);
      
      if (!dbModule.getChirpLikes) {
        throw new Error('getChirpLikes function not available');
      }
      
      const likesData = await dbModule.getChirpLikes(chirpId);
      console.log('✅ Likes data received:', likesData?.length || 0);
      setLikes(likesData || []);
    } catch (err) {
      console.error('❌ Error loading chirp likes:', err);
      setError('Failed to load likes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = (user: User) => {
    onClose();
    router.push(`/profile/${user.id}`);
  };

  const renderUser = ({ item }: { item: User }) => {
    const displayName = `${item.firstName} ${item.lastName}`.trim() || 'User';
    const handle = `@${item.customHandle || item.handle}`;
    
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
      >
        <UserAvatar user={item} size="md" />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userHandle}>{handle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading likes...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLikes}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (likes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No likes yet</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={likes}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {likes.length === 0 ? 'Likes' : `${likes.length} ${likes.length === 1 ? 'Like' : 'Likes'}`}
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        {renderContent()}
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#657786',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
  },
  placeholder: {
    width: 32,
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#657786',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#e91e63',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});
