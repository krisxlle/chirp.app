import { MessageSquare } from "lucide-react";
import { FeedbackDialog } from "./feedback-dialog";
import { Button } from "./button";
import { useLocation } from "wouter";

export function FloatingFeedback() {
  const [location] = useLocation();
  
  // Only show on search and notifications pages
  const shouldShow = location === '/search' || location === '/notifications';
  
  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      <FeedbackDialog
        trigger={
          <Button
            size="xs"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg h-8 px-2"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            <span className="text-xs">Feedback</span>
          </Button>
        }
        location="floating_button"
      />
    </div>
  );
}
