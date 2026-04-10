"use client";

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  buttonText?: string;
  size?: 'large' | 'medium' | 'small';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  width?: number;
}

export function GoogleLogin({ 
  onSuccess, 
  onError, 
  buttonText = 'Continue with Google',
  size = 'large',
  theme = 'outline',
  width = 400
}: GoogleLoginProps) {
  const { showToast } = useToast();

  useEffect(() => {
    // Load Google Script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error('Failed to load Google script');
      };
      document.body.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        // Render button
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          {
            theme: theme,
            size: size === 'large' ? 'large' : 'medium',
            width: width,
            text: buttonText.includes('Continue') ? 'signin_with' : 'signup_with',
          }
        );
      } catch (error) {
        console.error('Google init error:', error);
      }
    };

    loadGoogleScript();
  }, [theme, size, width, buttonText]);

  const handleCredentialResponse = (response: any) => {
    try {
      onSuccess(response.credential);
    } catch (error) {
      console.error('Google login error:', error);
      onError?.();
      showToast('Google login failed', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div id="google-btn-container" className="google-btn-container" />
      <style jsx>{`
        .google-btn-container {
          min-width: ${width}px;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

// Simple button version (manual implementation)
export function GoogleLoginButton({ onSuccess, onError }: { onSuccess: (credential: string) => void, onError?: () => void }) {
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      // For manual implementation without Google's button
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google/url`);
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      showToast('Failed to initiate Google login', 'error');
      onError?.();
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all font-medium"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}
