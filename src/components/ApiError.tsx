"use client"
import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ApiErrorProps {
    error: string | Error;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'inline' | 'banner' | 'toast';
    autoHide?: boolean;
}

export const ApiError: React.FC<ApiErrorProps> = ({
    error,
    onRetry,
    onDismiss,
    variant = 'inline',
    autoHide = true
}) => {
    const [show, setShow] = React.useState(true);
    const errorMessage = typeof error === 'string' ? error : error.message;

    React.useEffect(() => {
        if (autoHide) {
            const timer = setTimeout(() => setShow(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [autoHide]);

    if (!show) return null;

    const handleDismiss = () => {
        setShow(false);
        onDismiss?.();
    };

    // Inline error (inside forms, pages)
    if (variant === 'inline') {
        return (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-destructive">{errorMessage}</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="shrink-0 text-destructive hover:text-destructive/80 transition-colors"
                        title="Retry"
                    >
                        <RefreshCw size={16} />
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
                    title="Dismiss"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    // Banner error (top of page)
    if (variant === 'banner') {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/95 text-white px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                            >
                                Retry
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Toast-like error (bottom right)
    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-destructive text-white rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-3 w-full px-3 py-2 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};

interface ApiErrorHandlerProps {
    children: ReactNode;
    onError?: (error: Error) => void;
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({ children, onError }) => {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            setError(new Error(event.reason?.message || 'An error occurred'));
            onError?.(new Error(event.reason?.message || 'An error occurred'));
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }, [onError]);

    if (error) {
        return (
            <ApiError
                error={error}
                onDismiss={() => setError(null)}
                onRetry={() => setError(null)}
                variant="banner"
            />
        );
    }

    return <>{children}</>;
};
