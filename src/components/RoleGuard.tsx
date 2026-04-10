"use client"
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'customer')[];
  fallback?: ReactNode;
  redirect?: string;
}

/**
 * RoleGuard Component
 * Protects routes based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = ['admin', 'customer'],
  fallback,
  redirect
}) => {
  const { user, loading, isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && redirect) {
      router.push(redirect);
    }
  }, [loading, isAuthenticated, redirect, router]);

  // Show loading or fallback while checking auth
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has allowed role
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. 
            Your role ({user.role}) is not authorized.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * AdminGuard Component
 * Protects admin-only routes
 */
export const AdminGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleGuard
      allowedRoles={['admin']}
      fallback={fallback}
      redirect="/login"
    >
      {children}
    </RoleGuard>
  );
};

/**
 * CustomerGuard Component
 * Protects customer-only routes
 */
export const CustomerGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleGuard
      allowedRoles={['customer']}
      fallback={fallback}
      redirect="/login"
    >
      {children}
    </RoleGuard>
  );
};

/**
 * AuthGuard Component
 * Protects routes that require authentication (any role)
 */
export const AuthGuard: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleGuard
      allowedRoles={['admin', 'customer']}
      fallback={fallback}
      redirect="/login"
    >
      {children}
    </RoleGuard>
  );
};
