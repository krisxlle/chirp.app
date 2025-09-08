// Debug component to check all interactions on your chirps
// Add this to your app temporarily to see all interactions

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';

export default function ChirpInteractionsDebug() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkInteractions = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Checking all interactions for user:', user.id);

      // Get all your chirps with interaction counts
      const { data: chirpsWithStats, error: chirpsError } = await supabase
        .from('chirps')
        .select(`
          id,
          content,
          created_at
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (chirpsError) {
        console.error('❌ Error fetching chirps:', chirpsError);
        Alert.alert('Error', 'Failed to fetch chirps');
        return;
      }

      // Get all likes on your chirps
      const { data: likes, error: likesError } = await supabase
        .from('reactions')
        .select(`
          chirp_id,
          created_at,
          users!inner(
            first_name,
            last_name,
            custom_handle,
            handle,
            email
          ),
          chirps!inner(
            content
          )
        `)
        .eq('chirps.author_id', user.id)
        .order('created_at', { ascending: false });

      // Get all replies to your chirps
      const { data: replies, error: repliesError } = await supabase
        .from('chirps')
        .select(`
          id,
          content,
          created_at,
          reply_to_id,
          users!inner(
            first_name,
            last_name,
            custom_handle,
            handle,
            email
          ),
          original_chirp:chirps!reply_to_id(
            content
          )
        `)
        .eq('original_chirp.author_id', user.id)
        .order('created_at', { ascending: false });

      // Get all notifications related to your chirps
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          created_at,
          read,
          chirp_id,
          chirps!inner(
            content
          ),
          actor:from_user_id(
            first_name,
            last_name,
            custom_handle,
            handle
          )
        `)
        .eq('chirps.author_id', user.id)
        .order('created_at', { ascending: false });

      const result = {
        chirps: chirpsWithStats || [],
        likes: likes || [],
        replies: replies || [],
        notifications: notifications || [],
        summary: {
          totalChirps: chirpsWithStats?.length || 0,
          totalLikes: likes?.length || 0,
          totalReplies: replies?.length || 0,
          totalNotifications: notifications?.length || 0,
          unreadNotifications: notifications?.filter(n => !n.read).length || 0
        }
      };

      setInteractions(result);
      console.log('✅ Interactions loaded:', result.summary);

    } catch (error) {
      console.error('❌ Error checking interactions:', error);
      Alert.alert('Error', 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view interactions</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chirp Interactions Debug</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={checkInteractions}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Check All Interactions'}
          </Text>
        </TouchableOpacity>
      </View>

      {interactions && (
        <>
          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Summary</Text>
            <Text style={styles.summaryText}>Total Chirps: {interactions.summary.totalChirps}</Text>
            <Text style={styles.summaryText}>Total Likes Received: {interactions.summary.totalLikes}</Text>
            <Text style={styles.summaryText}>Total Replies Received: {interactions.summary.totalReplies}</Text>
            <Text style={styles.summaryText}>Total Notifications: {interactions.summary.totalNotifications}</Text>
            <Text style={styles.summaryText}>Unread Notifications: {interactions.summary.unreadNotifications}</Text>
          </View>

          {/* Your Chirps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Your Chirps ({interactions.chirps.length})</Text>
            {interactions.chirps.map((chirp) => (
              <View key={chirp.id} style={styles.item}>
                <Text style={styles.itemTitle}>Chirp #{chirp.id}</Text>
                <Text style={styles.itemContent}>{truncateText(chirp.content)}</Text>
                <Text style={styles.itemDate}>{formatDate(chirp.created_at)}</Text>
              </View>
            ))}
          </View>

          {/* Likes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❤️ Likes Received ({interactions.likes.length})</Text>
            {interactions.likes.map((like, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {like.users.custom_handle || like.users.handle} liked your chirp
                </Text>
                <Text style={styles.itemContent}>{truncateText(like.chirps.content)}</Text>
                <Text style={styles.itemDate}>{formatDate(like.created_at)}</Text>
              </View>
            ))}
          </View>

          {/* Replies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Replies Received ({interactions.replies.length})</Text>
            {interactions.replies.map((reply) => (
              <View key={reply.id} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {reply.users.custom_handle || reply.users.handle} replied to your chirp
                </Text>
                <Text style={styles.itemContent}>Reply: {truncateText(reply.content)}</Text>
                <Text style={styles.itemContent}>Original: {truncateText(reply.original_chirp.content)}</Text>
                <Text style={styles.itemDate}>{formatDate(reply.created_at)}</Text>
              </View>
            ))}
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notifications ({interactions.notifications.length})</Text>
            {interactions.notifications.map((notif) => (
              <View key={notif.id} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {notif.type} notification from {notif.actor?.custom_handle || notif.actor?.handle || 'Unknown'}
                  {notif.read ? ' ✅' : ' ❌'}
                </Text>
                <Text style={styles.itemContent}>{truncateText(notif.chirps.content)}</Text>
                <Text style={styles.itemDate}>{formatDate(notif.created_at)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemContent: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 10,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});
