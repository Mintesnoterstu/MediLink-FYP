import React from 'react';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const RoleBasedRenderer: React.FC<{
  allow: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allow, children, fallback = null }) => {
  const { user } = useAuth();
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (!user) return <>{fallback}</>;
  if (!allowedRoles.includes(user.role)) return <>{fallback}</>;

  return <>{children}</>;
};

