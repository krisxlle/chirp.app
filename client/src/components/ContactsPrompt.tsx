import { useQuery } from "@tanstack/react-query";
import { Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import ContactsIntegration from "./ContactsIntegration";
import { useAuth } from "./hooks/useAuth";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function ContactsPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Get user's follower count
  const { data: followCounts } = useQuery<{ followers: number; following: number }>({
    queryKey: [`/api/users/${user?.id}/follow-counts`],
    enabled: isAuthenticated && !!user?.id,
  });

  useEffect(() => {
    // Show prompt if user is authenticated, has less than 10 followers, and hasn't been shown before
    if (
      isAuthenticated && 
      user?.id && 
      followCounts?.followers !== undefined && 
      followCounts.followers < 10 && 
      !hasShownPrompt
    ) {
      // Check localStorage to see if user has dismissed this prompt
      const dismissedKey = `contacts-prompt-dismissed-${user.id}`;
      const hasDismissed = localStorage.getItem(dismissedKey) === 'true';
      
      if (!hasDismissed) {
        setShowPrompt(true);
      }
      setHasShownPrompt(true);
    }
  }, [isAuthenticated, user?.id, followCounts, hasShownPrompt]);

  const handleDismiss = () => {
    setShowPrompt(false);
    if (user?.id) {
      localStorage.setItem(`contacts-prompt-dismissed-${user.id}`, 'true');
    }
  };

  const handleConnectContacts = () => {
    setShowPrompt(false);
    setShowContactsModal(true);
  };

  if (!showPrompt) {
    return (
      <>
        <ContactsIntegration
          isOpen={showContactsModal}
          onClose={() => setShowContactsModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Find Friends on Chirp
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Connect your contacts to find friends who are already on Chirp and grow your network.
              </p>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleConnectContacts}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Connect Contacts
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ContactsIntegration
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </>
  );
}


