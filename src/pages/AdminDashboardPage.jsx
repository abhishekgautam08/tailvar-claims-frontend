import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdminDashboardPage Component
 * Landing page for administrators with welcome header.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page admin-dashboard">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Admin Console</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.displayName || user?.username}</strong>! Issue policies and adjudicate customer claims.
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="info-card">
          <div className="info-card-header">
            <h2 className="info-card-title">Administrative Operations Ready</h2>
          </div>
          <p className="info-card-text">
            Authentication and API clients are connected. Policy issuance and claim decision (APPROVE / REJECT) workflows are ready to be wired.
          </p>
          <div className="session-summary-box">
            <p><strong>Logged in as:</strong> {user?.displayName} (<code>{user?.username}</code>)</p>
            <p><strong>Account Role:</strong> <span className="user-role-badge role-admin">ADMIN</span></p>
            <p><strong>User ID:</strong> <code>{user?.id}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
