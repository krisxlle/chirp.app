import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/AuthContext';
import { apiRequest } from './api';
import UserAvatar from './UserAvatar';
import { X, Plus, Trash2 } from 'lucide-react';

interface ThreadComposerProps {
  onClose: () => void;
  initialContent?: string;
}

export default function ThreadComposer({ onClose, initialContent = '' }: ThreadComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threadChirps, setThreadChirps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [isPosting, setIsPosting] = useState(false);

  const maxLength = 280;
  const remainingChars = maxLength - currentContent.length;

  const addToThread = () => {
    if (!currentContent.trim()) {
      toast({
        title: "Empty chirp",
        description: "Please write something before adding to thread.",
        variant: "destructive",
      });
      return;
    }

    if (currentContent.length > maxLength) {
      toast({
        title: "Too long",
        description: `Chirps must be ${maxLength} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    setThreadChirps([...threadChirps, currentContent.trim()]);
    setCurrentContent("");
  };

  const removeFromThread = (index: number) => {
    setThreadChirps(threadChirps.filter((_, i) => i !== index));
  };

  const postThread = async () => {
    const hasCurrentContent = currentContent.trim();
    const hasThreadChirps = threadChirps.length > 0;
    
    if (!hasCurrentContent && !hasThreadChirps) {
      toast({
        title: "Empty thread",
        description: "Please write something before posting your thread.",
        variant: "destructive",
      });
      return;
    }

    if (hasCurrentContent && currentContent.length > maxLength) {
      toast({
        title: "Too long",
        description: `Current chirp must be ${maxLength} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    
    try {
      // Create the complete thread content array
      const allThreadContent = [...threadChirps];
      if (currentContent.trim()) {
        allThreadContent.push(currentContent.trim());
      }
      
      // Post thread via API
      const response = await apiRequest('/api/chirps/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: allThreadContent,
          userId: user?.id
        })
      });

      toast({
        title: "Thread posted!",
        description: `Your ${allThreadContent.length}-part thread has been shared.`,
      });

      onClose();
    } catch (error) {
      console.error('Error posting thread:', error);
      toast({
        title: "Error",
        description: "Failed to post thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return 'text-red-500';
    if (remainingChars < 20) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Thread</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Current input */}
          <div className="flex space-x-3 mb-4">
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
              <Textarea
                placeholder="Start a thread..."
                className="w-full resize-none border-none focus-visible:ring-0 text-base p-0 dark:bg-gray-900 dark:text-white min-h-[100px]"
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                maxLength={maxLength}
              />
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addToThread}
                  disabled={!currentContent.trim() || currentContent.length > maxLength}
                  className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Thread
                </Button>
                <span className={`text-sm ${getCharCountColor()}`}>
                  {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
                </span>
              </div>
            </div>
          </div>

          {/* Thread list */}
          {threadChirps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Thread ({threadChirps.length} parts)
              </h3>
              {threadChirps.map((chirp, index) => (
                <div key={index} className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white text-sm">{chirp}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Chirp {index + 1}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromThread(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {threadChirps.length > 0 && (
                <span>{threadChirps.length} parts in thread</span>
              )}
            </div>
            <Button
              onClick={postThread}
              disabled={(threadChirps.length === 0 && !currentContent.trim()) || isPosting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isPosting ? 'Posting...' : 'Post Thread'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}