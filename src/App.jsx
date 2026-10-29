import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

import LoginPage from './pages/LoginPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Root index redirector
 * Intelligently routes authenticated users to their specific dashboard,
 * or unauthenticated visitors to the login page.
 */
function IndexRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Initializing portal..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/customer'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<IndexRedirect />} />

          {/* Customer Portal (Protected + Role Restricted) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
              <Route element={<Layout />}>
                <Route path="/customer" element={<CustomerDashboardPage />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Console (Protected + Role Restricted) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

