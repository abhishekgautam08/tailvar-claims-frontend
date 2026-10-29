import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * CustomerDashboardPage Component
 * Landing page for customers with welcome header.
 */
export default function CustomerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page customer-dashboard">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">My Policies &amp; Claims</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.displayName || user?.username}</strong>! Manage your active policies and track claims.
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="info-card">
          <div className="info-card-header">
            <h2 className="info-card-title">Customer Portal Ready</h2>
          </div>
          <p className="info-card-text">
            Authentication and API clients are connected. Policy discovery and claim submission workflows are ready to be wired.
          </p>
          <div className="session-summary-box">
            <p><strong>Logged in as:</strong> {user?.displayName} (<code>{user?.username}</code>)</p>
            <p><strong>Account Role:</strong> <span className="user-role-badge role-customer">CUSTOMER</span></p>
            <p><strong>User ID:</strong> <code>{user?.id}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
