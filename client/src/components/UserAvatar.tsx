import React from 'react';

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
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export default function UserAvatar({ user, size = 'md', onPress }: UserAvatarProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: '32px', height: '32px', fontSize: '14px' };
      case 'lg':
        return { width: '64px', height: '64px', fontSize: '20px' };
      default:
        return { width: '48px', height: '48px', fontSize: '16px' };
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

  const sizeStyles = getSizeStyles();

  const avatarContent = (
    <div style={{
      ...sizeStyles,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
    >
      {user.profileImageUrl || user.avatarUrl ? (
        <img
          src={user.profileImageUrl || user.avatarUrl}
          alt={`${user.firstName || user.customHandle || user.handle || user.email.split('@')[0]}'s avatar`}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = getInitials();
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
      <button
        style={{
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer'
        }}
        onClick={onPress}
      >
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
}