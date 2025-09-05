import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuth } from './AuthContext';

// Determine the correct API URL based on platform and environment
const getApiBaseUrl = () => {
  // In development mode, use relative URLs to leverage Metro proxy
  if (__DEV__) {
    return '';
  }
  
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For physical device testing, use the computer's IP address
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return 'http://192.168.1.194:4000';
  }
  
  // For web, use localhost (default fallback)
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();

const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  console.log('PushNotificationProvider: User available:', !!user, 'User ID:', user?.id);

  useEffect(() => {
    if (!user?.id) {
      console.log('PushNotificationProvider: User not available, skipping initialization');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        console.log('Initializing push notifications...');
        console.log('Platform:', Platform.OS);
        console.log('Development mode:', __DEV__);
        console.log('API Base URL:', API_BASE_URL ? 'configured' : 'not configured');
        console.log('User ID:', user.id);
        
        // Skip push notifications on web platform
        if (Platform.OS === 'web') {
          console.log('Push notifications are not supported on web - skipping');
          return;
        }
        
        // Register for push notifications
        const token = await pushNotificationService.registerForPushNotifications();
        
        if (token) {
          console.log('Push token obtained:', token ? 'success' : 'failed');
          // Register token with backend
          await registerTokenWithBackend(user.id, token, Platform.OS);
          
          // Set up notification listeners
          const subscriptions = pushNotificationService.setupNotificationListeners();
          
          // Return cleanup function
          return () => {
            subscriptions.foreground.remove();
            subscriptions.response.remove();
          };
        } else {
          console.log('No push token obtained - notifications may not work');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, [user?.id]);

  return <>{children}</>;
};

// Register push token with backend
async function registerTokenWithBackend(userId: string, token: string, platform: string) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      const apiUrl = `${API_BASE_URL}/api/push-tokens`;
      console.log(`Attempt ${attempt}/${maxRetries}: Registering push token with API`);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${attempt}: Server responded with error:`, response.status, errorText);
        if (attempt === maxRetries) {
          throw new Error(`Failed to register push token: ${response.status} ${errorText}`);
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      const result = await response.json();
      console.log('Push token registered successfully');
      return; // Success, exit the retry loop
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Attempt ${attempt}: Request timeout - server may not be running`);
      } else {
        console.error(`Attempt ${attempt}: Error registering push token:`, error);
      }
      
      if (attempt === maxRetries) {
        console.error('All attempts failed to register push token');
        // Don't throw the error - just log it so the app continues to work
        // Push notifications are not critical for core app functionality
        return;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export default PushNotificationProvider;