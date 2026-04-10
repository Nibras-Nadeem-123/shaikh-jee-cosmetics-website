"use client"
import React, { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';

interface ShowForRoleProps {
  children: ReactNode;
  roles?: ('admin' | 'customer')[];
  fallback?: ReactNode;
}

/**
 * ShowForRole Component
 * Conditionally renders content based on user role
 * 
 * Usage:
 * <ShowForRole roles={['admin']}>
 *   <AdminButton />
 * </ShowForRole>
 */
export const ShowForRole: React.FC<ShowForRoleProps> = ({
  children,
  roles = ['admin', 'customer'],
  fallback = null
}) => {
  const { hasRole } = useRole();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * ShowForAdmin Component
 * Shows content only for admin users
 */
export const ShowForAdmin: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null
}) => {
  return (
    <ShowForRole roles={['admin']} fallback={fallback}>
      {children}
    </ShowForRole>
  );
};

/**
 * ShowForCustomer Component
 * Shows content only for customer users
 */
export const ShowForCustomer: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null
}) => {
  return (
    <ShowForRole roles={['customer']} fallback={fallback}>
      {children}
    </ShowForRole>
  );
};

/**
 * ShowWhenAuthenticated Component
 * Shows content only when user is authenticated
 */
export const ShowWhenAuthenticated: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * ShowWhenUnauthenticated Component
 * Shows content only when user is NOT authenticated
 */
export const ShowWhenUnauthenticated: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useRole();

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
