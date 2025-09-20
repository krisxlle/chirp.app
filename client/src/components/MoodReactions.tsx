import React, { useState } from 'react';
import { Button } from './ui/button';
import { Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react';

interface MoodReactionsProps {
  chirpId: string;
  reactionCounts: Record<string, number>;
  userReaction?: string | null;
  onReactionChange?: (chirpId: string, reaction: string | null) => void;
}

const REACTION_TYPES = [
  { key: '❤️', icon: Heart, label: 'Love', color: 'text-red-500' },
  { key: '👍', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
  { key: '😂', icon: Laugh, label: 'Laugh', color: 'text-yellow-500' },
  { key: '😢', icon: Frown, label: 'Sad', color: 'text-gray-500' },
  { key: '😡', icon: Angry, label: 'Angry', color: 'text-red-600' },
];

export default function MoodReactions({ 
  chirpId, 
  reactionCounts, 
  userReaction, 
  onReactionChange 
}: MoodReactionsProps) {
  const [isReacting, setIsReacting] = useState(false);

  const handleReaction = async (reaction: string) => {
    if (isReacting) return;
    
    setIsReacting(true);
    try {
      const newReaction = userReaction === reaction ? null : reaction;
      onReactionChange?.(chirpId, newReaction);
    } finally {
      setIsReacting(false);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  if (totalReactions === 0 && !userReaction) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 mt-2">
      {/* Reaction counts */}
      <div className="flex items-center space-x-2">
        {REACTION_TYPES.map(({ key, icon: Icon, label, color }) => {
          const count = reactionCounts[key] || 0;
          if (count === 0) return null;
          
          return (
            <div key={key} className="flex items-center space-x-1">
              <span className="text-lg">{key}</span>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
          );
        })}
      </div>

      {/* User's current reaction */}
      {userReaction && (
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-500">You reacted with</span>
          <span className="text-lg">{userReaction}</span>
        </div>
      )}
    </div>
  );
}