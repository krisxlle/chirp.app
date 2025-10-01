import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { MailIcon, XIcon } from './icons';
import { useSupabaseAuth } from './SupabaseAuthContext';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export default function EmailVerificationBanner({ onDismiss }: EmailVerificationBannerProps) {
  const { user, isEmailVerified, resendVerificationEmail } = useSupabaseAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if email is verified, user is not logged in, or banner is dismissed
  if (isEmailVerified || !user || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email and click the confirmation link.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to resend verification email.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '12px 16px',
      margin: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ flexShrink: 0 }}>
        <MailIcon size={20} color="#f59e0b" />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#92400e',
          marginBottom: '4px',
        }}>
          Verify Your Email Address
        </div>
        <div style={{
          fontSize: '13px',
          color: '#92400e',
          lineHeight: '18px',
        }}>
          Please check your email ({user.email}) and click the confirmation link to complete your registration.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleResendEmail}
          disabled={isResending}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isResending ? 'not-allowed' : 'pointer',
            opacity: isResending ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {isResending ? 'Sending...' : 'Resend'}
        </button>
        
        <button
          onClick={handleDismiss}
          style={{
            padding: '6px',
            backgroundColor: 'transparent',
            color: '#92400e',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <XIcon size={16} color="#92400e" />
        </button>
      </div>
    </div>
  );
}
