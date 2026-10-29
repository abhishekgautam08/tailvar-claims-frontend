import React from 'react';
import Money from '../Money';

/**
 * AdminSummaryStrip Component
 * Displays real-time aggregated metrics computed from active policies and claims:
 * total policies, total claims, pending approvals, total sum insured, and remaining SI.
 */
export default function AdminSummaryStrip({ policies = [], claims = [] }) {
  const totalPolicies = policies.length;
  const totalClaims = claims.length;

  const pendingClaims = claims.filter(
    (c) => (c.status || '').toUpperCase() === 'SUBMITTED'
  ).length;

  const totalSumInsured = policies.reduce(
    (sum, p) => sum + (typeof p.sumInsured === 'number' ? p.sumInsured : 0),
    0
  );

  const totalRemainingClaimable = policies.reduce(
    (sum, p) => sum + (typeof p.remainingClaimableSi === 'number' ? p.remainingClaimableSi : 0),
    0
  );

  return (
    <div className="summary-strip" aria-label="Portal overview summary">
      <div className="summary-card">
        <span className="summary-label">Total Policies</span>
        <span className="summary-value">{totalPolicies}</span>
        <span className="summary-sub">Issued across all accounts</span>
      </div>

      <div className="summary-card">
        <span className="summary-label">Total Claims</span>
        <span className="summary-value">{totalClaims}</span>
        <span className="summary-sub">Lifetime submissions</span>
      </div>

      <div className={`summary-card ${pendingClaims > 0 ? 'summary-card-highlight' : ''}`}>
        <span className="summary-label">Awaiting Decision</span>
        <div className="summary-value-wrapper">
          <span className="summary-value pending-value">{pendingClaims}</span>
          {pendingClaims > 0 && (
            <span className="pending-indicator-pill">Action needed</span>
          )}
        </div>
        <span className="summary-sub">SUBMITTED status claims</span>
      </div>

      <div className="summary-card">
        <span className="summary-label">Total Sum Insured</span>
        <span className="summary-value summary-money">
          <Money amount={totalSumInsured} />
        </span>
        <span className="summary-sub">Aggregate portfolio coverage</span>
      </div>

      <div className="summary-card">
        <span className="summary-label">Total Remaining Claimable</span>
        <span className="summary-value summary-money remaining-metric">
          <Money amount={totalRemainingClaimable} />
        </span>
        <span className="summary-sub">Unblocked portfolio capacity</span>
      </div>
    </div>
  );
}

