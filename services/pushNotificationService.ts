import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PushNotificationData {
  type: 'reaction' | 'mention' | 'follow' | 'reply' | 'mention_bio';
  chirpId?: string;
  fromUserId?: string;
  fromUserName?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Register for push notifications and get token
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications are only available on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get the token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'e37a8c05-4bf8-48d5-99a6-d9da36e1ff75', // From app.json
      });

      this.expoPushToken = token.data;
      console.log('Expo Push Token:', token.data);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7c3aed',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Get current push token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Handle notification received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      // Optionally show in-app notification or update badge
    });

    // Handle notification response (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      
      const data = response.notification.request.content.data as unknown as PushNotificationData;
      
      // Navigate based on notification type
      this.handleNotificationNavigation(data);
    });

    return {
      foreground: foregroundSubscription,
      response: responseSubscription,
    };
  }

  // Handle navigation when notification is tapped
  private handleNotificationNavigation(data: PushNotificationData) {
    // This would integrate with your navigation system
    console.log('Handling notification navigation:', data);
    
    switch (data.type) {
      case 'follow':
        if (data.fromUserId) {
          // Navigate to user profile
          console.log(`Navigate to profile: ${data.fromUserId}`);
        }
        break;
      case 'reaction':
      case 'reply':
      case 'mention':
        if (data.chirpId) {
          // Navigate to specific chirp/thread
          console.log(`Navigate to chirp: ${data.chirpId}`);
        }
        break;
      case 'mention_bio':
        if (data.fromUserId) {
          // Navigate to user profile
          console.log(`Navigate to profile: ${data.fromUserId}`);
        }
        break;
      default:
        // Navigate to notifications page
        console.log('Navigate to notifications');
        break;
    }
  }

  // Send local notification (for testing)
  async sendLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const pushNotificationService = PushNotificationService.getInstance();