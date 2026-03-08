import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/features/auth/LoginForm/LoginForm';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <LoginForm />;
};

