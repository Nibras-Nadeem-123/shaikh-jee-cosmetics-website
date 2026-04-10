"use client"
import { useApp } from '@/contexts/AppContext';

/**
 * Hook to check user role and permissions
 */
export const useRole = () => {
  const { user, isAuthenticated } = useApp();

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const hasRole = (roles: ('admin' | 'customer')[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (allowedRoles: ('admin' | 'customer')[]) => {
    if (!isAuthenticated) return false;
    return hasRole(allowedRoles);
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isCustomer,
    hasRole,
    canAccess,
    role: user?.role || null
  };
};
