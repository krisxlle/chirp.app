import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';

export default function Landing() {
  const { signOut, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Welcome to Chirp! 🐦
        </h1>
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Your social media app is working!
        </p>
        
        {user ? (
          <div>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Hello, {user.name || user.customHandle || user.email}! 👋
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleSignOut}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.8)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Sign Out
              </button>
              <button 
                onClick={() => setLocation('/')}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Please sign in to continue
            </p>
            <button 
              onClick={() => setLocation('/auth')}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              Sign In
            </button>
          </div>
        )}
        
        <button 
          onClick={() => alert('Chirp is working! 🎉')}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: 'rgba(124, 58, 237, 0.8)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '20px',
            backdropFilter: 'blur(10px)'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}