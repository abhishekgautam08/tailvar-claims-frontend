import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * NotFoundPage Component
 * 404 handler that redirects users back to their respective portal or login.
 */
export default function NotFoundPage() {
  const { user } = useAuth();
  const backTarget = user ? (user.role === 'ADMIN' ? '/admin' : '/customer') : '/login';

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The requested page could not be found or you might not have access to it.
        </p>
        <Link to={backTarget} className="btn btn-primary">
          Back to Portal
        </Link>
      </div>
    </div>
  );
}
