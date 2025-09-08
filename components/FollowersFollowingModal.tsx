import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getFollowers, getFollowing } from '../lib/database/mobile-db-supabase';
import UserAvatar from './UserAvatar';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
  bio?: string;
}

interface FollowersFollowingModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

export default function FollowersFollowingModal({ 
  visible, 
  onClose, 
  userId, 
  type, 
  title 
}: FollowersFollowingModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchUsers();
    }
  }, [visible, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Fetching ${type} for user:`, userId);
      
      let userData: User[] = [];
      
      if (type === 'followers') {
        userData = await getFollowers(userId);
      } else {
        userData = await getFollowing(userId);
      }
      
      console.log(`✅ Fetched ${userData.length} ${type}`);
      setUsers(userData);
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: User) => {
    onClose();
    router.push(`/profile/${user.id}`);
  };

  const getDisplayName = (user: User) => {
    return user.firstName || user.customHandle || user.handle || 'User';
  };

  const getUserHandle = (user: User) => {
    return user.customHandle || user.handle || 'user';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Loading {type}...</Text>
            </View>
          ) : (
            <ScrollView style={styles.usersList}>
              {users.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No {type} yet
                  </Text>
                </View>
              ) : (
                users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => handleUserPress(user)}
                  >
                    <UserAvatar 
                      user={{
                        id: user.id,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: '',
                        customHandle: user.customHandle,
                        handle: user.handle,
                        profileImageUrl: user.profileImageUrl
                      }} 
                      size="md" 
                    />
                    
                    <View style={styles.userInfo}>
                      <View style={styles.nameContainer}>
                        <Text style={styles.displayName}>{getDisplayName(user)}</Text>
                        {user.isChirpPlus && user.showChirpPlusBadge && (
                          <View style={styles.chirpPlusBadge}>
                            <Text style={styles.chirpPlusBadgeText}>+</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.handle}>@{getUserHandle(user)}</Text>
                      {user.bio && (
                        <Text style={styles.bio} numberOfLines={2}>
                          {user.bio}
                        </Text>
                      )}
                    </View>

                    <View style={styles.chevron}>
                      <Text style={styles.chevronText}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  usersList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chirpPlusBadge: {
    marginLeft: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  chirpPlusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: '#d1d5db',
    fontWeight: '300',
  },
});