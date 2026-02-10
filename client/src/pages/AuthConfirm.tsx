import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

export default function AuthConfirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [location] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        if (type === 'signup' && token) {
          // Confirm the email
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage('Email confirmation failed. Please try again.');
          } else if (data.user) {
            console.log('✅ Email confirmed for user:', data.user.id);
            
            // Create user profile if it doesn't exist
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id')
              .eq('id', data.user.id)
              .single();
            
            if (!existingProfile) {
              console.log('📝 Creating user profile...');
              
              // Get user metadata
              const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
              const customHandle = data.user.user_metadata?.custom_handle || data.user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
              
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  first_name: userName.split(' ')[0] || userName,
                  last_name: userName.split(' ').slice(1).join(' ') || '',
                  custom_handle: customHandle,
                  handle: customHandle || `user_${data.user.id.substring(0, 8)}`,
                  bio: '',
                  profile_image_url: null,
                  banner_image_url: null,
                  crystal_balance: 100,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (profileError) {
                console.error('❌ Error creating profile:', profileError);
                // Don't fail the confirmation, just log the error
              } else {
                console.log('✅ User profile created successfully');
              }
            }
            
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in.');
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during email confirmation.');
      }
    };

    handleAuthCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Confirming Email...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Confirmed!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <a
                href="/auth"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sign In
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-600 text-4xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmation Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <a
                href="/auth"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
