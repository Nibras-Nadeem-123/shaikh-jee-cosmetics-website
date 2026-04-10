"use client";

import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="text-center max-w-md px-6">
        <div className="mb-8">
          <WifiOff className="w-24 h-24 mx-auto text-muted-foreground opacity-50" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          You&apos;re Offline
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          It looks like you&apos;ve lost your internet connection. 
          Some features may not be available until you&apos;re back online.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-all"
          >
            <Home size={20} />
            Go Home
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-white/50 rounded-xl border border-primary/10">
          <h3 className="font-semibold text-foreground mb-2">Tip:</h3>
          <p className="text-sm text-muted-foreground">
            Install our app for better offline support and quick access to your favorite products.
          </p>
        </div>
      </div>
    </div>
  );
}
