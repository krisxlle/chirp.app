import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/useColorScheme';
import { AuthProvider } from '../components/AuthContext';
import PushNotificationProvider from '../components/PushNotificationProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <PushNotificationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="profile/[userId]" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_right'
              }} 
            />
            <Stack.Screen name="test-profile" />
            <Stack.Screen name="test-navigation" />
            <Stack.Screen name="test-direct-profile" />
            <Stack.Screen name="feedback" />
            <Stack.Screen name="user-profile" />
            <Stack.Screen name="profile-page" />
            <Stack.Screen name="view-profile" />
            <Stack.Screen name="support" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PushNotificationProvider>
    </AuthProvider>
  );
}
