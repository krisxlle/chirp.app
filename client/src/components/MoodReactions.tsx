import React from 'react';

interface MoodReactionsProps {
  chirpId?: string;
  onReaction?: (mood: string) => void;
}

export default function MoodReactions({ chirpId, onReaction }: MoodReactionsProps) {
  return (
    <div className="flex gap-2 p-2">
      <button 
        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
        onClick={() => onReaction?.('happy')}
      >
        😊 Happy
      </button>
      <button 
        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
        onClick={() => onReaction?.('excited')}
      >
        🎉 Excited
      </button>
      <button 
        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
        onClick={() => onReaction?.('thoughtful')}
      >
        🤔 Thoughtful
      </button>
    </div>
  );
}
