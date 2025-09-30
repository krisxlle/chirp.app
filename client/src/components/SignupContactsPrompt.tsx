import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import ContactsIntegration from "./ContactsIntegration";

interface SignupContactsPromptProps {
  onComplete?: () => void;
}

export default function SignupContactsPrompt({ onComplete }: SignupContactsPromptProps) {
  const [showContactsModal, setShowContactsModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Show contacts integration after successful signup
    if (isAuthenticated && user?.id && !hasShownPrompt) {
      // Check if user just signed up (created recently)
      const userCreatedAt = new Date(user.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (userCreatedAt > fiveMinutesAgo) {
        setShowContactsModal(true);
      }
      setHasShownPrompt(true);
    }
  }, [isAuthenticated, user, hasShownPrompt]);

  const handleContactsComplete = () => {
    setShowContactsModal(false);
    onComplete?.();
  };

  return (
    <ContactsIntegration
      isOpen={showContactsModal}
      onClose={handleContactsComplete}
      isSignup={true}
    />
  );
}
