import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { listPolicies } from '../api/policies';
import { listClaims } from '../api/claims';
import PolicyCard from '../components/customer/PolicyCard';
import ClaimForm from '../components/customer/ClaimForm';
import ClaimsTable from '../components/customer/ClaimsTable';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

/**
 * CustomerDashboardPage Component
 * Full customer portal featuring policies overview, claim submission with
 * dynamic validation against policy limits, real-time claims tracking,
 * and automated tab focus synchronization.
 */
export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Form policy selection
  const [selectedPolicyId, setSelectedPolicyId] = useState('');

  // Refs for scrolling and focus
  const claimFormCardRef = useRef(null);

  // Fetch policies and claims in parallel
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setLoadError(null);
      } else {
        setRefreshing(true);
      }

      const [policiesData, claimsData] = await Promise.all([
        listPolicies(),
        listClaims()
      ]);

      const fetchedPolicies = Array.isArray(policiesData) ? policiesData : [];
      const fetchedClaims = Array.isArray(claimsData) ? claimsData : [];

      setPolicies(fetchedPolicies);
      setClaims(fetchedClaims);

      // Auto-select the first policy if none currently selected
      setSelectedPolicyId((prev) => {
        if (prev && fetchedPolicies.some((p) => p.policyId === prev)) {
          return prev;
        }
        return fetchedPolicies.length > 0 ? fetchedPolicies[0].policyId : '';
      });

      setLoadError(null);
    } catch (err) {
      if (isInitial) {
        setLoadError(err.message || 'Failed to load policy and claim details.');
      } else {
        console.error('Failed to refresh customer data:', err);
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

  // Window focus & tab visibility change listener
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

  // Handle clicking "File a claim" on a policy card
  const handleFileClaim = (policy) => {
    setSelectedPolicyId(policy.policyId);
    if (claimFormCardRef.current) {
      claimFormCardRef.current.scrollIntoView({ behavior: 'smooth' });
      // Attempt to focus the date input or the policy select
      const dateInput = claimFormCardRef.current.querySelector('#claim-incident-date');
      if (dateInput) {
        setTimeout(() => dateInput.focus(), 300);
      }
    }
  };

  // Handle successful claim submission
  const handleSubmitSuccess = () => {
    // Refetch both lists for total data consistency
    loadData(false);
  };

  if (loading) {
    return <Loading message="Loading your policies and claims..." />;
  }

  return (
    <div className="customer-dashboard">
      {/* 1) Page Header with Refresh Action */}
      <header className="page-header customer-page-header">
        <div className="page-header-text">
          <h1 className="page-title">My Policies &amp; Claims</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.displayName || user?.username}</strong>! Manage your active coverage and track your claims.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-refresh"
            onClick={() => loadData(false)}
            disabled={refreshing || loading}
            aria-label="Refresh policies and claims"
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

      {/* 2) My Policies Section */}
      <section className="dashboard-section" aria-labelledby="section-policies-title">
        <div className="section-header">
          <div className="section-header-text">
            <h2 id="section-policies-title" className="section-title">
              My Policies
            </h2>
            <p className="section-subtitle">
              Active insurance coverage currently issued to your account.
            </p>
          </div>
        </div>

        {policies.length === 0 ? (
          <EmptyState
            title="No policies yet"
            description="Please contact your administrator to have an insurance policy issued."
          />
        ) : (
          <div className="policy-grid">
            {policies.map((policy) => (
              <PolicyCard
                key={policy.policyId || policy.id}
                policy={policy}
                onFileClaim={handleFileClaim}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3) Submit a Claim Section */}
      <section className="dashboard-section" aria-labelledby="section-claim-form-title">
        <ClaimForm
          policies={policies}
          selectedPolicyId={selectedPolicyId}
          onSelectPolicyId={setSelectedPolicyId}
          onSubmitSuccess={handleSubmitSuccess}
          onPolicyRefreshNeeded={() => loadData(false)}
          formCardRef={claimFormCardRef}
        />
      </section>

      {/* 4) My Claims Section */}
      <section className="dashboard-section" aria-labelledby="section-claims-title">
        <ClaimsTable claims={claims} />
      </section>
    </div>
  );
}
