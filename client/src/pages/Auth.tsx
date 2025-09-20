import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // For sign up, we'll use email as username for now
        const result = await signIn(email, password);
        if (!result.success) {
          alert(result.error || 'Sign up failed');
        }
      } else {
        // For sign in, use email as username
        const result = await signIn(email, password);
        if (!result.success) {
          alert(result.error || 'Sign in failed');
        }
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '400px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {isSignUp ? 'Sign up to join Chirp' : 'Sign in to continue to Chirp'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder={isSignUp ? "Enter your email" : "Enter your username or email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          {isSignUp && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
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
                    padding: '12px 16px', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </>
          )}
          
          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: isLoading ? '#9ca3af' : '#7c3aed', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '16px'
            }}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: 'transparent', 
            color: '#7c3aed', 
            border: '1px solid #7c3aed', 
            borderRadius: '8px',
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