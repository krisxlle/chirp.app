import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Send, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ThreadComposerProps {
  onClose?: () => void;
  className?: string;
  initialContent?: string;
}

interface ThreadPart {
  id: string;
  content: string;
}

export default function ThreadComposer({ onClose, className, initialContent = '' }: ThreadComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [threadParts, setThreadParts] = useState<ThreadPart[]>([
    { id: '1', content: initialContent },
    { id: '2', content: '' }
  ]);

  const createThreadMutation = useMutation({
    mutationFn: async (parts: Array<{ content: string }>) => {
      return await apiRequest("POST", "/api/chirps/thread", {
        threadParts: parts
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "chirps"] });
      toast({
        title: "Thread Posted",
        description: "Your thread has been shared successfully!",
      });
      setThreadParts([
        { id: '1', content: '' },
        { id: '2', content: '' }
      ]);
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post thread",
        variant: "destructive",
      });
    },
  });

  const addPart = () => {
    if (threadParts.length < 10) {
      setThreadParts(prev => [...prev, {
        id: Date.now().toString(),
        content: ''
      }]);
    }
  };

  const removePart = (id: string) => {
    if (threadParts.length > 2) {
      setThreadParts(prev => prev.filter(part => part.id !== id));
    }
  };

  const updatePart = (id: string, content: string) => {
    setThreadParts(prev => prev.map(part => 
      part.id === id ? { ...part, content } : part
    ));
  };

  const handleSubmit = () => {
    const validParts = threadParts
      .map(part => ({ content: part.content.trim() }))
      .filter(part => part.content.length > 0);

    if (validParts.length < 2) {
      toast({
        title: "Invalid Thread",
        description: "A thread must have at least 2 parts with content",
        variant: "destructive",
      });
      return;
    }

    createThreadMutation.mutate(validParts);
  };

  const totalCharacters = threadParts.reduce((sum, part) => sum + part.content.length, 0);
  const isValid = threadParts.filter(part => part.content.trim().length > 0).length >= 2;
  const hasOverLimit = threadParts.some(part => part.content.length > 280);

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Create Thread</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({threadParts.filter(p => p.content.trim()).length}/10 parts)
            </span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Thread Parts */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {threadParts.map((part, index) => (
            <div key={part.id} className="relative">
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium text-purple-600 dark:text-purple-400">
                    {index + 1}
                  </div>
                  {index < threadParts.length - 1 && (
                    <div className="w-0.5 h-6 bg-purple-200 dark:bg-purple-800 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={part.content}
                    onChange={(e) => updatePart(part.id, e.target.value)}
                    placeholder={index === 0 ? "Start your story..." : "Continue your thread..."}
                    className="min-h-[80px] resize-none"
                    maxLength={280}
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${part.content.length > 280 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {part.content.length}/280
                    </span>
                    
                    {threadParts.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePart(part.id)}
                        className="text-red-500 hover:text-red-600 h-auto p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Part Button */}
        {threadParts.length < 10 && (
          <Button
            variant="outline"
            onClick={addPart}
            className="w-full border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Part ({threadParts.length + 1}/10)
          </Button>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
          <span>Total characters: {totalCharacters}</span>
          <span>Valid parts: {threadParts.filter(p => p.content.trim()).length}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || hasOverLimit || createThreadMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {createThreadMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {createThreadMutation.isPending ? "Posting..." : "Post Thread"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}