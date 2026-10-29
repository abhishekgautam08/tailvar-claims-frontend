import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * RoleRoute Component
 * Restricts access to users having one of the allowed roles.
 * Redirects unauthorized users to their appropriate dashboard.
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authorization..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's role-appropriate home
    const fallbackPath = user.role === 'ADMIN' ? '/admin' : '/customer';
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}

