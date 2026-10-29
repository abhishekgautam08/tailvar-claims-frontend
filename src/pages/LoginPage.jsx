import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const DEMO_ACCOUNTS = [
  {
    role: 'Customer 1',
    type: 'CUSTOMER',
    username: 'customer1',
    password: 'Customer1@Demo26',
    description: 'Claims & policies view',
  },
  {
    role: 'Customer 2',
    type: 'CUSTOMER',
    username: 'customer2',
    password: 'Customer2@Demo26',
    description: 'Second insured customer',
  },
  {
    role: 'Administrator',
    type: 'ADMIN',
    username: 'admin',
    password: 'Admin@Demo26',
    description: 'Adjudication & policy creation',
  },
];

/**
 * LoginPage Component
 * Handles user authentication with validation, demo pre-fill, and session expiry alerts.
 */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to their home
  useEffect(() => {
    if (user) {
      const target = user.role === 'ADMIN' ? '/admin' : '/customer';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const isExpired = searchParams.get('expired') === '1';

  const handleUseDemo = (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setValidationError('');
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setValidationError('Username is required.');
      return;
    }
    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authUser = await login(trimmedUsername, password);

      // Determine redirect location
      const fromPath = location.state?.from?.pathname;
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
      } else {
        const dest = authUser.role === 'ADMIN' ? '/admin' : '/customer';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon" aria-hidden="true">🛡️</div>
          <h1 className="login-title">Sign in to Tailvar</h1>
          <p className="login-subtitle">Insurance Policy &amp; Claims Management Portal</p>
        </div>

        {isExpired && (
          <Alert
            type="info"
            message="Your session has expired. Please sign in again to continue."
          />
        )}

        {validationError && (
          <Alert type="error" message={validationError} />
        )}

        {apiError && (
          <Alert type="error" message={apiError} />
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. customer1 or admin"
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" aria-hidden="true" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <section className="demo-accounts-box" aria-labelledby="demo-accounts-heading">
          <h2 id="demo-accounts-heading" className="demo-heading">
            Demo Credentials
          </h2>
          <p className="demo-subheading">
            Click "Use" to auto-populate the sign-in form:
          </p>
          <ul className="demo-list">
            {DEMO_ACCOUNTS.map((demo) => (
              <li key={demo.username} className="demo-item">
                <div className="demo-info">
                  <div className="demo-role-line">
                    <strong className="demo-name">{demo.role}</strong>
                    <span className={`user-role-badge role-${demo.type.toLowerCase()}`}>
                      {demo.type}
                    </span>
                  </div>
                  <div className="demo-cred">
                    <code>{demo.username}</code> / <code>{demo.password}</code>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUseDemo(demo)}
                  disabled={isSubmitting}
                  aria-label={`Use demo account for ${demo.role}`}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
