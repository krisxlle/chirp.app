import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UserAvatarProps {
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
    avatarUrl?: string;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  style?: any;
}

export default function UserAvatar({ user, size = "md", style }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeStyles = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 }, 
    lg: { width: 48, height: 48 },
    xl: { width: 80, height: 80 },
  };

  const textSizeStyles = {
    sm: { fontSize: 12 },
    md: { fontSize: 14 },
    lg: { fontSize: 16 }, 
    xl: { fontSize: 20 },
  };

  if (!user) {
    return (
      <View style={[
        styles.avatar,
        sizeStyles[size],
        { backgroundColor: '#e5e7eb' },
        style
      ]}>
        <Text style={[styles.fallbackText, textSizeStyles[size], { color: '#6b7280' }]}>
          ?
        </Text>
      </View>
    );
  }

  // Generate a consistent color based on user ID
  const colors = [
    ['#a855f7', '#ec4899'], // purple to pink
    ['#3b82f6', '#8b5cf6'], // blue to purple
    ['#10b981', '#3b82f6'], // green to blue
    ['#ec4899', '#ef4444'], // pink to red
    ['#6366f1', '#8b5cf6'], // indigo to purple
    ['#f59e0b', '#f97316'], // yellow to orange
    ['#14b8a6', '#3b82f6'], // teal to blue
    ['#ef4444', '#ec4899'], // red to pink
  ];

  const colorIndex = user.id ? parseInt(user.id.replace(/\D/g, '')) % colors.length : 0;
  const selectedColors = colors[colorIndex];
  const startColor = selectedColors[0];
  const endColor = selectedColors[1];

  const imageUrl = user.profileImageUrl || user.avatarUrl;
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email.split('@')[0];
  
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  if (imageUrl && !imageError) {
    return (
      <View style={[sizeStyles[size], style]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.avatar, sizeStyles[size]]}
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.avatar,
      sizeStyles[size],
      { backgroundColor: startColor }, // Using start color as fallback
      style
    ]}>
      <Text style={[styles.fallbackText, textSizeStyles[size]]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});