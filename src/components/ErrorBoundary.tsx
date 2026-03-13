"use client"
import React, { Component, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertOctagon size={48} className="text-destructive" />
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Oops! Something Went Wrong
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our beauty consultants are working diligently to resolve this issue.
              </p>

              {this.state.error && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 text-left">
                  <p className="text-sm text-foreground/70 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <Link
                href="/"
                className="px-8 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Return Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="bg-secondary/30 p-6 rounded-2xl border border-primary/20">
              <p className="text-sm text-foreground/80">
                Need immediate assistance? Contact our support team at{' '}
                <a href="mailto:support@shaikhjee.com" className="text-primary font-bold hover:underline">
                  support@shaikhjee.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for route-level errors
export const ErrorFallback = ({ error, reset }: { error?: Error; reset?: () => void }) => {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertOctagon size={48} className="text-destructive" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The treasure you seek has vanished into the ether.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {reset && (
            <button
              onClick={reset}
              className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          )}
          <Link
            href="/"
            className="px-8 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
