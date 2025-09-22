import React from 'react';
import { Button } from './ui/button';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
}

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
}

export default function UserAvatar({ user, size = 'md', onPress }: UserAvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-16 h-16 text-xl';
      case 'xl':
        return 'w-24 h-24 text-2xl'; // Added xl size for profile pages
      default:
        return 'w-12 h-12 text-base';
    }
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.customHandle) {
      return user.customHandle[0].toUpperCase();
    }
    if (user.handle) {
      return user.handle[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const avatarContent = (
    <div className={`${getSizeClasses()} rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold cursor-pointer transition-transform hover:scale-105`}>
      {user.profileImageUrl || user.avatarUrl ? (
        <img
          src={user.profileImageUrl || user.avatarUrl}
          alt={`${user.firstName || user.customHandle || user.handle || user.email.split('@')[0]}'s avatar`}
          className="w-full h-full rounded-full object-cover aspect-square"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              // Use textContent instead of innerHTML to prevent XSS
              parent.textContent = getInitials();
            }
          }}
        />
      ) : (
        getInitials()
      )}
    </div>
  );

  if (onPress) {
    return (
      <Button
        variant="ghost"
        className="p-0 h-auto w-auto"
        onClick={onPress}
      >
        {avatarContent}
      </Button>
    );
  }

  return avatarContent;
}