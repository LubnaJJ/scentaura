import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface Props {
  children: React.ReactNode;
}

const RequireAdminAuth: React.FC<Props> = ({ children }) => {
  const isAdminLoggedIn = useStore((s) => s.isAdminLoggedIn);
  const authLoading = useStore((s) => s.authLoading);

  // Wait for Firebase Auth to resolve before deciding whether to redirect
  if (authLoading) return null;

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default RequireAdminAuth;
