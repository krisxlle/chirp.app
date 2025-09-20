import { cn } from "../lib/utils.ts";
import { useState } from "react";

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
  className?: string;
}

export default function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-xl",
  };

  if (!user) {
    return (
      <div className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        <span className={cn("text-gray-500", textSizeClasses[size])}>?</span>
      </div>
    );
  }

  // Generate a consistent color based on user ID
  const colors = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-purple-500",
    "from-green-400 to-blue-500",
    "from-pink-400 to-red-500",
    "from-indigo-400 to-purple-600",
    "from-yellow-400 to-orange-500",
    "from-teal-400 to-blue-500",
    "from-red-400 to-pink-500",
  ];

  const colorIndex = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const gradientClass = colors[colorIndex];

  const avatarSrc = user.avatarUrl || user.profileImageUrl;
  if (avatarSrc && !imageError) {
    // Add cache-busting for OpenAI generated images to ensure fresh loads
    const cacheBustedSrc = avatarSrc.includes('oaidalleapiprodscus') 
      ? `${avatarSrc}&cache_bust=${Date.now()}` 
      : avatarSrc;
      
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <img
          src={cacheBustedSrc}
          alt={user.customHandle || user.handle || `User ${user.id}`}
          className="rounded-full object-cover w-full h-full bg-gray-100 dark:bg-gray-800"
          onError={(e) => {
            console.log('Avatar image failed to load:', avatarSrc);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully');
          }}
        />
      </div>
    );
  }

  // Use initials as fallback - prioritize custom handle, then handle, then user ID
  const displayName = user.customHandle || user.handle || `User${user.id}`;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold",
      sizeClasses[size],
      `bg-gradient-to-br ${gradientClass}`,
      className
    )}>
      <span className={textSizeClasses[size]}>{initials}</span>
    </div>
  );
}
