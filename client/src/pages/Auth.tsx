import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';

// Custom Icon Components (adapted for web)
const SparklesIcon = ({ size = 24, color = "#ffffff" }) => (
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

const HeartIcon = ({ size = 24, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill={color}
    />
  </svg>
);

const BotIcon = ({ size = 24, color = "#ffffff" }) => (
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

// Chirp Logo Component
const ChirpLogo = ({ size = 60 }) => (
  <div style={{
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }}>
    <img 
      src="/favicon.png" 
      alt="Chirp Logo" 
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
  </div>
);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { signIn, signUp, isAuthenticated } = useSupabaseAuth();
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
      if (isSignUp) {
        // Handle sign up
        if (!name || !email || !password || !dateOfBirth) {
          alert('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        
        // Calculate age from date of birth
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Verify user is at least 13 years old
        if (age < 13) {
          alert('You must be at least 13 years old to create a Chirp account');
          setIsLoading(false);
          return;
        }
        
        const result = await signUp(email, password, name, customHandle || undefined, dateOfBirth);
        
        if (result.success) {
          if (result.error === 'EMAIL_CONFIRMATION_REQUIRED') {
            alert((result as any).message || 'Please check your email and click the confirmation link to complete your registration.');
            // Don't redirect, let user see the message
          } else {
            setLocation('/');
          }
        } else {
          alert(result.error || 'Sign up failed');
        }
      } else {
        // Handle sign in
        const result = await signIn(email, password);
        if (result.success) {
          setLocation('/');
        } else {
          alert(result.error || 'Authentication failed');
        }
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
        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        {/* Logo and Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <ChirpLogo size={80} />
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Chirp
          </h1>
          <p style={{ 
            color: '#ffffff', 
            fontSize: '18px',
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            The social media gacha app.
          </p>
        </div>

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
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Reset Password
            </h2>
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
      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* Logo and Branding */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <ChirpLogo size={80} />
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#ffffff',
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Chirp
        </h1>
        <p style={{ 
          color: '#ffffff', 
          fontSize: '18px',
          opacity: 0.9,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          The social media gacha app.
        </p>
      </div>

      {/* Features */}
      <div style={{ 
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <SparklesIcon size={24} color="#ffffff" />
          <span style={{ 
            color: '#ffffff', 
            fontSize: '16px',
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Pull for collectible profile frames from the gacha
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <HeartIcon size={24} color="#ffffff" />
          <span style={{ 
            color: '#ffffff', 
            fontSize: '16px',
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Engage with posts to earn crystals
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '12px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <BotIcon size={24} color="#ffffff" />
          <span style={{ 
            color: '#ffffff', 
            fontSize: '16px',
            fontWeight: '500',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Raise your profile power and get more views
          </span>
        </div>
      </div>

      {/* Sign In Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isSignUp ? 'Join Chirp' : 'Welcome back'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue to Chirp'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isSignUp ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Date of Birth (must be 13 or older)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
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
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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