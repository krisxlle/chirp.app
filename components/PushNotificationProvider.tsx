import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuth } from './AuthContext';

const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initializePushNotifications = async () => {
      try {
        // Register for push notifications
        const token = await pushNotificationService.registerForPushNotifications();
        
        if (token) {
          // Register token with backend
          await registerTokenWithBackend(user.id, token, Platform.OS);
          
          // Set up notification listeners
          const subscriptions = pushNotificationService.setupNotificationListeners();
          
          // Return cleanup function
          return () => {
            subscriptions.foreground.remove();
            subscriptions.response.remove();
          };
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, [user]);

  return <>{children}</>;
};

// Register push token with backend
async function registerTokenWithBackend(userId: string, token: string, platform: string) {
  try {
    const response = await fetch('/api/push-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register push token');
    }

    console.log('Push token registered successfully');
  } catch (error) {
    console.error('Error registering push token:', error);
  }
}

export default PushNotificationProvider;