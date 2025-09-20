import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { X, Heart } from 'lucide-react';

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

interface ChirpLikesModalProps {
  visible: boolean;
  chirpId: string;
  likes: User[];
  onClose: () => void;
}

export default function ChirpLikesModal({ 
  visible, 
  chirpId, 
  likes, 
  onClose 
}: ChirpLikesModalProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Liked by {likes.length} {likes.length === 1 ? 'person' : 'people'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Likes list */}
        <div className="flex-1 overflow-y-auto">
          {likes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No likes yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {likes.map((user) => (
                <div key={user.id} className="p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.customHandle || user.handle || user.email.split('@')[0]
                      }
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{user.customHandle || user.handle || user.email.split('@')[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
