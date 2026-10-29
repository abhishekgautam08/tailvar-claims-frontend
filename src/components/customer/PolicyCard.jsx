import React from 'react';
import Money from '../Money';
import { formatDate } from '../../utils/format';

/**
 * PolicyCard Component
 * Displays a customer's policy details, coverage period, sum insured metrics,
 * and a quick-action button to initiate a claim against this policy.
 */
export default function PolicyCard({ policy, onFileClaim }) {
  const isFullyUtilised = policy.remainingClaimableSi <= 0;

  return (
    <article className="policy-card" aria-labelledby={`policy-${policy.policyId}`}>
      <div className="policy-card-header">
        <span id={`policy-${policy.policyId}`} className="policy-id-badge">
          {policy.policyId}
        </span>
        {isFullyUtilised && (
          <span className="policy-fully-utilised-badge">Fully utilised</span>
        )}
      </div>

      <div className="policy-dates" aria-label="Coverage Period">
        <span className="calendar-icon" aria-hidden="true">📅</span>
        <span>
          {formatDate(policy.startDate)} to {formatDate(policy.endDate)}
        </span>
      </div>

      <div className="policy-metrics">
        <div className="policy-metric">
          <span className="metric-label">Sum Insured</span>
          <span className="metric-value">
            <Money amount={policy.sumInsured} />
          </span>
        </div>

        <div className="policy-metric">
          <span className="metric-label">Blocked Amount</span>
          <span className="metric-value">
            <Money amount={policy.blockedAmount} />
          </span>
        </div>

        <div className="policy-metric metric-remaining">
          <span className="metric-label">Remaining Claimable</span>
          <span className="metric-value remaining-highlight">
            <Money amount={policy.remainingClaimableSi} />
          </span>
        </div>
      </div>

      <div className="policy-card-footer">
        {isFullyUtilised && (
          <span className="utilised-note">Sum insured fully consumed</span>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onFileClaim(policy)}
          aria-label={`File a claim for policy ${policy.policyId}`}
        >
          File a claim
        </button>
      </div>
    </article>
  );
}

