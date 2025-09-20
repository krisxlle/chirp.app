import React from 'react';
import { Crown } from 'lucide-react';

interface ChirpPlusBadgeProps {
  size?: number;
  className?: string;
}

export default function ChirpPlusBadge({ size = 16, className = '' }: ChirpPlusBadgeProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1">
        <Crown className="text-white" size={size} />
      </div>
    </div>
  );
}