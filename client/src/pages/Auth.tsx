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

const fontHeading = { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 as const };
const fontBody = { fontFamily: "'Inter', sans-serif" };

/** Chirp color guide */
const c = {
  deepPurple: '#6A4C92',
  vibrantPurple: '#A240D1',
  magentaPink: '#D94CC2',
  mediumLavender: '#9D8CD9',
  lightBlueGrey: '#BEC6EB',
  paleLavender: '#E2DAFF',
  softPeach: '#FDEADF',
  dustyRose: '#E1A0C3',
} as const;

const authPageGradient = `linear-gradient(135deg, #5d4f78 0%, #66558c 11%, #6A4C92 22%, #7460a6 33%, #826fb6 44%, #8f7fc6 52%, #9D8CD9 60%, #9D8CD9 66%, #9588ce 72%, #7d68aa 82%, #5d4f78 100%)`;
const authAtmosphere = `linear-gradient(135deg, rgba(90, 74, 114, 0.08) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(62, 44, 98, 0.08) 100%)`;

const CLOUD_PATH =
  'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z';

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  border: `2px solid ${c.lightBlueGrey}`,
  borderRadius: '12px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'rgba(226, 218, 255, 0.45)',
  color: c.deepPurple,
  ...fontBody,
};

const formCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '40px',
  borderRadius: '20px',
  border: `1px solid ${c.lightBlueGrey}`,
  boxShadow: '0 20px 48px rgba(106, 76, 146, 0.18)',
  maxWidth: '400px',
  width: '100%',
  position: 'relative',
  zIndex: 1,
};

/** Single SVG path — uniform fill, no overlap seams */
function SolidCloudWeb({
  size,
  opacity,
  style,
}: {
  size: number;
  opacity: number;
  style: React.CSSProperties;
}) {
  const h = size * 0.65;
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', ...style }}
      aria-hidden
    >
      <path fill="#ffffff" fillOpacity={opacity} d={CLOUD_PATH} />
    </svg>
  );
}

function AuthSkyDecor() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: authAtmosphere,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <SolidCloudWeb size={200} opacity={0.12} style={{ top: '5%', left: '-6%' }} />
        <SolidCloudWeb size={160} opacity={0.11} style={{ top: '16%', right: '-4%' }} />
        <SolidCloudWeb size={240} opacity={0.1} style={{ bottom: '14%', left: '4%' }} />
        <SolidCloudWeb size={130} opacity={0.11} style={{ bottom: '26%', right: '12%' }} />
        <SolidCloudWeb size={175} opacity={0.1} style={{ top: '3%', left: '38%' }} />
        <SolidCloudWeb size={145} opacity={0.1} style={{ bottom: '8%', right: '-6%' }} />
        <SolidCloudWeb size={115} opacity={0.11} style={{ top: '40%', left: '22%' }} />
      </div>
    </>
  );
}

// Chirp Logo — brand mark (#6A4C92 tile, white bird); asset: public/chirp-mark.png
const ChirpLogo = ({ size = 60 }) => (
  <div
    style={{
      margin: '0 auto 16px',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#6A4C92',
        boxShadow: '0 3px 12px rgba(26, 15, 46, 0.15)',
      }}
    >
      <img
        src="/chirp-mark.png"
        alt="Chirp"
        style={{
          width: size,
          height: size + 4,
          marginTop: -2,
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
      />
    </div>
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
      <div
        id="chirp-auth-page"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: authPageGradient,
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <style>{`
          #chirp-auth-page input:focus {
            border-color: ${c.vibrantPurple} !important;
            outline: none;
            background-color: ${c.paleLavender} !important;
          }
          #chirp-auth-page input::placeholder {
            color: ${c.mediumLavender};
            opacity: 0.85;
          }
        `}</style>
        <AuthSkyDecor />
        {/* Logo and Branding */}
        <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          <ChirpLogo size={80} />
          <p
            style={{
              color: c.softPeach,
              fontSize: '15px',
              marginBottom: '10px',
              textShadow: `0 1px 3px rgba(106, 76, 146, 0.45)`,
              ...fontHeading,
            }}
          >
            Find Your Flock ✦
          </p>
          <h1
            style={{
              fontSize: '36px',
              color: '#ffffff',
              marginBottom: '8px',
              textShadow: `0 2px 4px rgba(106, 76, 146, 0.35)`,
              ...fontHeading,
            }}
          >
            Chirp
          </h1>
        </div>

        <div
          style={{
            ...formCardStyle,
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                fontSize: '24px',
                color: c.deepPurple,
                marginBottom: '8px',
                ...fontHeading,
              }}
            >
              Reset Password
            </h2>
            <p style={{ color: c.mediumLavender, fontSize: '16px', ...fontBody }}>
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
                style={inputBaseStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isForgotPasswordLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isForgotPasswordLoading ? c.lightBlueGrey : c.mediumLavender,
                color: c.deepPurple,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isForgotPasswordLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px',
                ...fontBody,
              }}
            >
              {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          {forgotPasswordMessage && (
            <div
              style={{
                padding: '12px',
                backgroundColor: c.paleLavender,
                border: `1px solid ${c.mediumLavender}`,
                borderRadius: '8px',
                color: c.deepPurple,
                fontSize: '14px',
                marginBottom: '16px',
                ...fontBody,
              }}
            >
              {forgotPasswordMessage}
            </div>
          )}

          <button
            onClick={() => setShowForgotPassword(false)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: c.vibrantPurple,
              border: `1px solid ${c.vibrantPurple}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              ...fontBody,
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="chirp-auth-page"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: authPageGradient,
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <style>{`
        #chirp-auth-page input:focus {
          border-color: ${c.vibrantPurple} !important;
          outline: none;
          background-color: ${c.paleLavender} !important;
        }
        #chirp-auth-page input::placeholder {
          color: ${c.mediumLavender};
          opacity: 0.85;
        }
      `}</style>
      <AuthSkyDecor />
      {/* Logo and Branding */}
      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
        <ChirpLogo size={80} />
        <p
          style={{
            color: c.softPeach,
            fontSize: '15px',
            marginBottom: '10px',
            textShadow: `0 1px 3px rgba(106, 76, 146, 0.45)`,
            ...fontHeading,
          }}
        >
          Find Your Flock ✦
        </p>
        <h1
          style={{
            fontSize: '36px',
            color: '#ffffff',
            marginBottom: '8px',
            textShadow: `0 2px 4px rgba(106, 76, 146, 0.35)`,
            ...fontHeading,
          }}
        >
          Chirp
        </h1>
      </div>

      {/* Features */}
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(253, 234, 223, 0.22)',
            border: `1px solid rgba(190, 198, 235, 0.5)`,
            padding: '12px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <SparklesIcon size={24} color={c.paleLavender} />
          <span
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: `0 1px 2px rgba(106, 76, 146, 0.35)`,
              ...fontBody,
            }}
          >
            Pull from the gacha
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(226, 218, 255, 0.2)',
            border: `1px solid rgba(157, 140, 217, 0.45)`,
            padding: '12px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <HeartIcon size={24} color={c.softPeach} />
          <span
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: `0 1px 2px rgba(106, 76, 146, 0.35)`,
              ...fontBody,
            }}
          >
            Engage with posts to earn crystals
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(225, 160, 195, 0.18)',
            border: `1px solid rgba(253, 234, 223, 0.45)`,
            padding: '12px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <BotIcon size={24} color={c.lightBlueGrey} />
          <span
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              textShadow: `0 1px 2px rgba(106, 76, 146, 0.35)`,
              ...fontBody,
            }}
          >
            Raise your profile power and get more views
          </span>
        </div>
      </div>

      {/* Sign In Form */}
      <div style={formCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2
            style={{
              fontSize: '24px',
              color: c.deepPurple,
              marginBottom: '8px',
              ...fontHeading,
            }}
          >
            {isSignUp ? 'Join Chirp' : 'Welcome back'}
          </h2>
          <p style={{ color: c.mediumLavender, fontSize: '16px', ...fontBody }}>
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
                  style={inputBaseStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputBaseStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: c.deepPurple,
                    marginBottom: '8px',
                    fontWeight: '500',
                    ...fontBody,
                  }}
                >
                  Date of Birth (must be 13 or older)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  style={inputBaseStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Custom Handle (optional)"
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  style={inputBaseStyle}
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
                style={inputBaseStyle}
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
              style={inputBaseStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading ? c.lightBlueGrey : c.mediumLavender,
              color: c.deepPurple,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '16px',
              ...fontBody,
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
              color: c.mediumLavender,
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
              ...fontBody,
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
            color: c.vibrantPurple,
            border: `1px solid ${c.vibrantPurple}`,
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ...fontBody,
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}