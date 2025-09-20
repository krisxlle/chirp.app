import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { signOut, user } = useAuth();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Chirp!</h1>
      <p>Your social media app is working!</p>
      
      {user ? (
        <div>
          <p>Hello, {user.firstName || user.email}!</p>
          <button 
            onClick={signOut}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              margin: '10px'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p>Please sign in to continue</p>
      )}
      
      <button 
        onClick={() => alert('Chirp is working!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#7c3aed', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          margin: '10px'
        }}
      >
        Test Button
      </button>
    </div>
  );
}