import { storage } from './storage';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface ExpoMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

// Create Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional - not required for sending notifications
  useFcmV1: true
});

class NotificationService {
  // Create notification and send push notification
  async createAndSendNotification(
    userId: string,
    type: string,
    fromUserId?: string,
    chirpId?: number,
    customTitle?: string,
    customBody?: string
  ) {
    try {
      // Create database notification
      const notification = await storage.createNotification({
        userId,
        type,
        fromUserId,
        chirpId,
      });

      // Send push notification
      await this.sendPushNotification(notification, customTitle, customBody);

      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  // Send push notification to user's devices
  async sendPushNotification(
    notification: any,
    customTitle?: string,
    customBody?: string
  ) {
    try {
      // Get user's push tokens
      const pushTokens = await storage.getUserPushTokens(notification.userId);
      
      if (pushTokens.length === 0) {
        console.log('No push tokens found for user', notification.userId);
        return;
      }

      // Get notification details
      const { title, body } = await this.getNotificationContent(
        notification,
        customTitle,
        customBody
      );

      // Send to each device
      const promises = pushTokens.map(tokenData => 
        this.sendToDevice(tokenData.token, tokenData.platform, {
          title,
          body,
          data: {
            type: notification.type,
            notificationId: notification.id.toString(),
            fromUserId: notification.fromUserId,
            chirpId: notification.chirpId?.toString(),
          }
        })
      );

      await Promise.allSettled(promises);

      // Mark push as sent
      await storage.markPushNotificationSent(notification.id);

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get notification content based on type
  async getNotificationContent(
    notification: any,
    customTitle?: string,
    customBody?: string
  ): Promise<{ title: string; body: string }> {
    
    if (customTitle && customBody) {
      return { title: customTitle, body: customBody };
    }

    let fromUser = null;
    if (notification.fromUserId) {
      fromUser = await storage.getUser(notification.fromUserId);
    }

    const displayName = fromUser ? 
      (fromUser.customHandle || fromUser.handle || `${fromUser.firstName} ${fromUser.lastName}`.trim() || 'Someone') :
      'Someone';

    switch (notification.type) {
      case 'reaction':
        return {
          title: '💖 New Reaction',
          body: `${displayName} reacted to your chirp!`
        };
      
      case 'reply':
        return {
          title: '💬 New Reply', 
          body: `${displayName} replied to your chirp!`
        };
      
      case 'repost':
        return {
          title: '🔄 New Repost',
          body: `${displayName} reposted your chirp!`
        };
      
      case 'follow':
        return {
          title: '👥 New Follower',
          body: `${displayName} started following you!`
        };
      
      case 'weekly_summary':
        return {
          title: '📊 Weekly Summary Ready!',
          body: 'Your personalized weekly summary is ready to view!'
        };
      
      default:
        return {
          title: '🐤 Chirp Notification',
          body: 'You have a new notification!'
        };
    }
  }

  // Send to specific device using Expo Push Notifications
  async sendToDevice(token: string, platform: string, payload: PushNotificationPayload) {
    try {
      // Check if the push token is valid
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        return;
      }

      // Create the message
      const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: 1,
        channelId: 'default',
      };

      console.log(`Sending push notification to ${platform} device:`, message);

      // Send the notification
      const ticketChunk = await expo.sendPushNotificationsAsync([message]);
      console.log('Push notification ticket:', ticketChunk);

      // Handle any errors
      for (const ticket of ticketChunk) {
        if (ticket.status === 'error') {
          console.error('Error sending push notification:', ticket.message);
          if (ticket.details?.error === 'DeviceNotRegistered') {
            // Remove invalid token from database
            await storage.removePushToken(token);
          }
        }
      }

    } catch (error) {
      console.error(`Error sending push to ${platform} device:`, error);
    }
  }

  // Send weekly summary notifications to all users
  async sendWeeklySummaryNotifications() {
    try {
      console.log('Sending weekly summary notifications to all users...');
      
      const allUsers = await storage.getAllUsers();
      
      const promises = allUsers.map(user => 
        this.createAndSendNotification(
          user.id,
          'weekly_summary',
          undefined,
          undefined,
          '📊 Weekly Summary Ready!',
          'Your personalized weekly summary is ready to view!'
        )
      );

      await Promise.allSettled(promises);
      
      console.log(`Weekly summary notifications sent to ${allUsers.length} users`);
    } catch (error) {
      console.error('Error sending weekly summary notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();