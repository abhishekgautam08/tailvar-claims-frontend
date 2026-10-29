import React, { useState, useMemo } from 'react';
import Money from '../Money';
import StatusBadge from '../StatusBadge';
import EmptyState from '../EmptyState';
import { formatDate, formatDateTime } from '../../utils/format';

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
];

/**
 * ClaimsTable Component
 * Displays the list of customer claims with client-side status filtering,
 * responsive mobile scrolling, and accessible empty states.
 */
export default function ClaimsTable({ claims = [] }) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter claims client-side while preserving newest-first order
  const filteredClaims = useMemo(() => {
    if (statusFilter === 'ALL') {
      return claims;
    }
    return claims.filter((claim) => (claim.status || '').toUpperCase() === statusFilter);
  }, [claims, statusFilter]);

  if (claims.length === 0) {
    return (
      <div className="claims-section">
        <div className="section-header">
          <h2 className="section-title">My Claims</h2>
        </div>
        <EmptyState
          title="No claims found"
          description="You have not submitted any claims yet."
        />
      </div>
    );
  }

  return (
    <div className="claims-section">
      <div className="section-header">
        <div className="section-header-text">
          <h2 className="section-title">My Claims</h2>
          <p className="section-subtitle">
            Track claims submitted against your policies and view real-time status decisions.
          </p>
        </div>
      </div>

      {/* Filter and Count Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-btn-group" role="group" aria-label="Filter claims by status">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="filter-count">
          Showing {filteredClaims.length} of {claims.length} claims
        </div>
      </div>

      {/* Claims Data Table or Filtered Empty State */}
      {filteredClaims.length === 0 ? (
        <EmptyState
          title="No matching claims"
          description={`No claims with status "${statusFilter.toLowerCase()}" found.`}
        />
      ) : (
        <div className="table-responsive" tabIndex={0} aria-label="Claims history table">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Claim ID</th>
                <th scope="col">Policy</th>
                <th scope="col">Incident Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted On</th>
                <th scope="col">Decided On</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => {
                const policyDisplay = claim.policy?.policyId || claim.policyId || '—';
                return (
                  <tr key={claim.id || claim.claimId}>
                    <td>
                      <code className="claim-id-text">{claim.claimId}</code>
                    </td>
                    <td>
                      <code className="policy-id-text">{policyDisplay}</code>
                    </td>
                    <td>{formatDate(claim.incidentDate)}</td>
                    <td>
                      <Money amount={claim.amount} className="claim-amount-text" />
                    </td>
                    <td>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td>{formatDateTime(claim.createdAt)}</td>
                    <td>
                      {claim.decidedAt ? formatDateTime(claim.decidedAt) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
