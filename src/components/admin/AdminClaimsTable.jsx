import React, { useState, useMemo, useRef } from 'react';
import Money from '../Money';
import StatusBadge from '../StatusBadge';
import EmptyState from '../EmptyState';
import Alert from '../Alert';
import { decideClaim } from '../../api/claims';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
];

/**
 * AdminClaimsTable Component
 * Displays all claims with dual filtering (status & customer), "Pending only" shortcut,
 * and an inline confirmation workflow for APPROVE / REJECT adjudication.
 */
export default function AdminClaimsTable({
  claims = [],
  customers = [],
  onClaimDecided
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');

  // Confirmation state: { claimId, decision, triggerBtnRef }
  const [confirmState, setConfirmState] = useState(null);
  const [savingClaimId, setSavingClaimId] = useState(null);

  const [actionAlert, setActionAlert] = useState(null); // { type: 'success'|'error', message }
  const actionAlertRef = useRef(null);

  // Filter claims client-side
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchStatus =
        statusFilter === 'ALL' || (claim.status || '').toUpperCase() === statusFilter;

      const cId = claim.customer?.id || claim.customer?._id || claim.customer;
      const cUsername = claim.customer?.username;
      const matchCustomer =
        customerFilter === 'ALL' || cId === customerFilter || cUsername === customerFilter;

      return matchStatus && matchCustomer;
    });
  }, [claims, statusFilter, customerFilter]);

  // Count of pending claims
  const pendingCount = useMemo(() => {
    return claims.filter((c) => (c.status || '').toUpperCase() === 'SUBMITTED').length;
  }, [claims]);

  // Initiate confirmation
  const handleInitiateConfirm = (claim, decision, e) => {
    setActionAlert(null);
    setConfirmState({
      claimId: claim.id || claim.claimId,
      claim,
      decision,
      triggerBtn: e.currentTarget
    });
  };

  // Cancel confirmation and return focus
  const handleCancelConfirm = () => {
    const trigger = confirmState?.triggerBtn;
    setConfirmState(null);
    if (trigger && typeof trigger.focus === 'function') {
      setTimeout(() => trigger.focus(), 20);
    }
  };

  // Execute adjudication
  const handleExecuteDecision = async (claim, decision) => {
    const idToUse = claim.id || claim.claimId;
    setSavingClaimId(idToUse);
    setActionAlert(null);

    try {
      await decideClaim(idToUse, decision);

      const actionVerb = decision === 'APPROVED' ? 'approved' : 'rejected';
      setActionAlert({
        type: 'success',
        message: `${claim.claimId} ${actionVerb}`
      });

      setConfirmState(null);

      // Refetch policies and claims so numbers and statuses update
      if (onClaimDecided) {
        onClaimDecided();
      }

      // Move focus to action alert
      setTimeout(() => {
        if (actionAlertRef.current) {
          actionAlertRef.current.focus();
        }
      }, 50);
    } catch (err) {
      setActionAlert({
        type: 'error',
        message: err.message || `Failed to ${decision.toLowerCase()} claim.`
      });

      // If claim was already decided (409) or not found (404), refetch claims to clear stale row
      if (err.status === 409 || err.code === 'CLAIM_ALREADY_DECIDED' || err.status === 404) {
        if (onClaimDecided) {
          onClaimDecided();
        }
      }
      setConfirmState(null);

      setTimeout(() => {
        if (actionAlertRef.current) {
          actionAlertRef.current.focus();
        }
      }, 50);
    } finally {
      setSavingClaimId(null);
    }
  };

  return (
    <div className="claims-section admin-table-section">
      <div className="section-header">
        <div className="section-header-text">
          <h2 className="section-title">All Claims</h2>
          <p className="section-subtitle">
            Review and adjudicate claims submitted by customers against their policies.
          </p>
        </div>
      </div>

      {/* Action Notification with accessible focus */}
      {actionAlert && (
        <div ref={actionAlertRef} tabIndex={-1} className="alert-focus-wrapper">
          <Alert type={actionAlert.type} message={actionAlert.message} />
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="filter-toolbar admin-claims-filter-toolbar">
        <div className="filter-group-wrap">
          {/* Status Buttons */}
          <div className="filter-btn-group" role="group" aria-label="Filter claims by status">
            {STATUS_FILTERS.map((f) => (
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

          {/* Pending Only Shortcut */}
          <button
            type="button"
            className={`btn btn-sm btn-pending-shortcut ${statusFilter === 'SUBMITTED' ? 'active-shortcut' : ''}`}
            onClick={() => setStatusFilter('SUBMITTED')}
          >
            ⚡ Pending only ({pendingCount})
          </button>

          {/* Customer Dropdown */}
          <div className="filter-customer-wrapper">
            <label htmlFor="claims-filter-customer" className="filter-label">
              Customer:
            </label>
            <select
              id="claims-filter-customer"
              className="form-input form-select filter-select"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id || c.username} value={c.id || c.username}>
                  {c.displayName || c.username} ({c.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-count">
          Showing {filteredClaims.length} of {claims.length} claims
        </div>
      </div>

      {/* Claims Data Table or Empty State */}
      {filteredClaims.length === 0 ? (
        <EmptyState
          title="No claims found"
          description={
            statusFilter === 'SUBMITTED'
              ? 'No claims are currently pending adjudication.'
              : 'No claims match the selected status and customer filters.'
          }
        />
      ) : (
        <div className="table-responsive" tabIndex={0} aria-label="Claims management table">
          <table className="data-table admin-data-table">
            <thead>
              <tr>
                <th scope="col">Claim ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Policy</th>
                <th scope="col">Incident Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted On</th>
                <th scope="col">Decided On</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => {
                const claimId = claim.id || claim.claimId;
                const customerDisplay = claim.customer
                  ? `${claim.customer.displayName || claim.customer.username} (${claim.customer.username})`
                  : '—';
                const policyDisplay = claim.policy?.policyId || claim.policyId || '—';
                const isPending = (claim.status || '').toUpperCase() === 'SUBMITTED';
                const isConfirming = confirmState?.claimId === claimId;
                const isSaving = savingClaimId === claimId;

                return (
                  <tr key={claimId} className={isConfirming ? 'row-confirming' : ''}>
                    <td>
                      <code className="claim-id-text">{claim.claimId}</code>
                    </td>
                    <td>
                      <span className="customer-name-text">{customerDisplay}</span>
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
                    <td className="actions-cell">
                      {isPending ? (
                        isConfirming ? (
                          <div
                            className="inline-confirm-box"
                            role="region"
                            aria-label={`Confirm ${confirmState.decision} for claim ${claim.claimId}`}
                          >
                            <div className="confirm-content">
                              <span className="confirm-title">
                                <strong>
                                  {confirmState.decision === 'APPROVED' ? 'Approve' : 'Reject'} {claim.claimId}?
                                </strong>
                              </span>
                              <span className="confirm-impact">
                                {confirmState.decision === 'APPROVED'
                                  ? 'Approving keeps the amount blocked against the policy.'
                                  : `Rejecting releases ${formatMoney(claim.amount)} back to the policy's remaining SI.`}
                              </span>
                            </div>
                            <div className="confirm-btn-actions">
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  confirmState.decision === 'APPROVED'
                                    ? 'btn-approve-action'
                                    : 'btn-reject-action'
                                }`}
                                onClick={() => handleExecuteDecision(claim, confirmState.decision)}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Saving...' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={handleCancelConfirm}
                                disabled={isSaving}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="actions-btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-approve"
                              onClick={(e) => handleInitiateConfirm(claim, 'APPROVED', e)}
                              disabled={isSaving}
                              aria-label={`Approve claim ${claim.claimId}`}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-reject"
                              onClick={(e) => handleInitiateConfirm(claim, 'REJECTED', e)}
                              disabled={isSaving}
                              aria-label={`Reject claim ${claim.claimId}`}
                            >
                              Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="decided-placeholder">-</span>
                      )}
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

