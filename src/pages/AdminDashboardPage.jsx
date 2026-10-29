import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { listCustomers } from '../api/customers';
import { listPolicies } from '../api/policies';
import { listClaims } from '../api/claims';

import AdminSummaryStrip from '../components/admin/AdminSummaryStrip';
import PolicyForm from '../components/admin/PolicyForm';
import AdminPoliciesTable from '../components/admin/AdminPoliciesTable';
import AdminClaimsTable from '../components/admin/AdminClaimsTable';

import Loading from '../components/Loading';
import Alert from '../components/Alert';

/**
 * AdminDashboardPage Component
 * Administrative Command Center:
 * - Aggregated portfolio metrics summary strip
 * - Policy issuance with customer lookup and boundary validation
 * - Global policies overview with customer filtering
 * - Claims adjudication (Approve / Reject) with inline confirmation
 * - Parallel data loading & tab focus auto-refresh
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Fetch customers, policies, and claims in parallel
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setLoadError(null);
      } else {
        setRefreshing(true);
      }

      const [customersData, policiesData, claimsData] = await Promise.all([
        listCustomers(),
        listPolicies(),
        listClaims()
      ]);

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setPolicies(Array.isArray(policiesData) ? policiesData : []);
      setClaims(Array.isArray(claimsData) ? claimsData : []);

      setLoadError(null);
    } catch (err) {
      if (isInitial) {
        setLoadError(err.message || 'Failed to load administration data.');
      } else {
        console.error('Failed to refresh admin data:', err);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Refetch when tab regains focus or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(false);
      }
    };

    const handleWindowFocus = () => {
      loadData(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadData]);

  // Callback after policy creation
  const handlePolicyCreated = () => {
    loadData(false);
  };

  // Callback after claim adjudication
  const handleClaimDecided = () => {
    loadData(false);
  };

  if (loading) {
    return <Loading message="Loading administration console..." />;
  }

  return (
    <div className="admin-dashboard">
      {/* 1) Page Header with Refresh Button */}
      <header className="page-header admin-page-header">
        <div className="page-header-text">
          <h1 className="page-title">Admin Console</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.displayName || user?.username}</strong>! Issue insurance policies and adjudicate customer claims.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-refresh"
            onClick={() => loadData(false)}
            disabled={refreshing || loading}
            aria-label="Refresh administrative data"
          >
            <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`} aria-hidden="true">
              ⟳
            </span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Global Load Error with Retry */}
      {loadError && (
        <div className="dashboard-error-wrapper">
          <Alert type="error" message={loadError} />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => loadData(true)}
          >
            Try again
          </button>
        </div>
      )}

      {/* 2) Summary Strip */}
      <section className="dashboard-section" aria-labelledby="section-summary-title">
        <h2 id="section-summary-title" className="visually-hidden">
          Portfolio Overview Summary
        </h2>
        <AdminSummaryStrip policies={policies} claims={claims} />
      </section>

      {/* 3) Create Policy Form */}
      <section className="dashboard-section" aria-labelledby="section-create-policy">
        <PolicyForm
          customers={customers}
          onPolicyCreated={handlePolicyCreated}
        />
      </section>

      {/* 4) All Policies Table */}
      <section className="dashboard-section" aria-labelledby="section-all-policies">
        <AdminPoliciesTable
          policies={policies}
          customers={customers}
        />
      </section>

      {/* 5) All Claims Table */}
      <section className="dashboard-section" aria-labelledby="section-all-claims">
        <AdminClaimsTable
          claims={claims}
          customers={customers}
          onClaimDecided={handleClaimDecided}
        />
      </section>
    </div>
  );
}
