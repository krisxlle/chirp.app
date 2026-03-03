import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('chirp_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('chirp_cookie_consent', 'accepted');
    localStorage.setItem('chirp_cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('chirp_cookie_consent', 'declined');
    localStorage.setItem('chirp_cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderTop: '1px solid #e5e7eb',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            We value your privacy
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            margin: 0
          }}>
            We use cookies and similar technologies to provide, maintain, and improve our services. 
            This includes authentication, security, analytics, and personalization. By clicking "Accept All", 
            you consent to our use of cookies.{' '}
            <button
              onClick={() => setLocation('/privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '14px'
              }}
            >
              Learn more
            </button>
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleAccept}
            style={{
              padding: '12px 24px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
          >
            Accept All
          </button>
          
          <button
            onClick={handleDecline}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            Decline
          </button>
          
          <button
            onClick={() => setLocation('/privacy')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#7c3aed',
              border: '1px solid #7c3aed',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f4ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cookie Settings
          </button>
        </div>
      </div>
    </div>
  );
}
