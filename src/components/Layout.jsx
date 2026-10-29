import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Layout Component
 * Provides the shared application shell with header, user badge, logout, and outlet.
 */
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const homePath = user?.role === 'ADMIN' ? '/admin' : '/customer';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-container">
          <Link to={homePath} className="header-brand">
            <span className="brand-logo" aria-hidden="true">🛡️</span>
            <div className="brand-text">
              <span className="brand-name">Tailvar Claims</span>
              <span className="brand-sub">Policy &amp; Claims Portal</span>
            </div>
          </Link>

          {user && (
            <div className="header-user-nav">
              <div className="user-profile">
                <span className="user-avatar" aria-hidden="true">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </span>
                <div className="user-details">
                  <span className="user-name">{user.displayName || user.username}</span>
                  <span className={`user-role-badge role-${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm btn-logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out of application"
              >
                {isLoggingOut ? 'Logging out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <Outlet />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p>© 2026 Tailvar Insurance • Secure Claims Processing</p>
        </div>
      </footer>
    </div>
  );
}

