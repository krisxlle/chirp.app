import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

// Custom Icon Components (adapted for web)
const SparklesIcon = ({ size = 24, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" 
      fill={color}
    />
    <path 
      d="M20 3v4M22 5h-4M6 16v2M7 17H5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

const HeartIcon = ({ size = 24, color = "#ec4899" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill={color}
    />
  </svg>
);

const BotIcon = ({ size = 24, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 12h.01M16 12h.01" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 16s1 1 3 1 3-1 3-1" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { signIn, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use email as username for authentication
      const result = await signIn(email || username, password);
      if (result.success) {
        setLocation('/');
      } else {
        alert(result.error || 'Authentication failed');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    
    try {
      // For now, just show a message - implement actual password reset later
      setForgotPasswordMessage('Password reset functionality coming soon!');
    } catch (error) {
      setForgotPasswordMessage('Error sending reset email. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #ec4899, #a855f7)',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <BotIcon size={40} color="#7c3aed" />
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Reset Password
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Enter your email to receive reset instructions
            </p>
          </div>
          
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isForgotPasswordLoading}
              style={{ 
                width: '100%', 
                padding: '16px', 
                backgroundColor: isForgotPasswordLoading ? '#9ca3af' : '#7c3aed', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isForgotPasswordLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px'
              }}
            >
              {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
          
          {forgotPasswordMessage && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              color: '#0369a1',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {forgotPasswordMessage}
            </div>
          )}
          
          <button 
            onClick={() => setShowForgotPassword(false)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: 'transparent', 
              color: '#7c3aed', 
              border: '1px solid #7c3aed', 
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <BotIcon size={40} color="#7c3aed" />
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isSignUp ? 'Join Chirp' : 'Welcome back'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue to Chirp'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isSignUp ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Custom Handle (optional)"
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Username or Email"
                value={username || email}
                onChange={(e) => {
                  if (e.target.value.includes('@')) {
                    setEmail(e.target.value);
                    setUsername('');
                  } else {
                    setUsername(e.target.value);
                    setEmail('');
                  }
                }}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                required
              />
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              backgroundColor: isLoading ? '#9ca3af' : '#7c3aed', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '16px'
            }}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        {!isSignUp && (
          <button 
            onClick={() => setShowForgotPassword(true)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: 'transparent', 
              color: '#6b7280', 
              border: 'none', 
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Forgot your password?
          </button>
        )}
        
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: 'transparent', 
            color: '#7c3aed', 
            border: '1px solid #7c3aed', 
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}