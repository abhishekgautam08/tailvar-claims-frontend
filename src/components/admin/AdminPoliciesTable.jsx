import React, { useState, useMemo } from 'react';
import Money from '../Money';
import EmptyState from '../EmptyState';
import { formatDate } from '../../utils/format';

/**
 * AdminPoliciesTable Component
 * Renders all issued insurance policies with customer details, coverage limits,
 * and client-side filtering by customer account.
 */
export default function AdminPoliciesTable({ policies = [], customers = [] }) {
  const [customerFilter, setCustomerFilter] = useState('ALL');

  // Filter policies client-side
  const filteredPolicies = useMemo(() => {
    if (customerFilter === 'ALL') {
      return policies;
    }
    return policies.filter((p) => {
      const cId = p.customer?.id || p.customer?._id || p.customer;
      const cUsername = p.customer?.username;
      return cId === customerFilter || cUsername === customerFilter;
    });
  }, [policies, customerFilter]);

  return (
    <div className="claims-section admin-table-section">
      <div className="section-header">
        <div className="section-header-text">
          <h2 className="section-title">All Policies</h2>
          <p className="section-subtitle">
            Overview of all active insurance policies across customer accounts.
          </p>
        </div>
      </div>

      {/* Filter and Count Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <label htmlFor="policy-filter-customer" className="filter-label">
            Filter by customer:
          </label>
          <select
            id="policy-filter-customer"
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

        <div className="filter-count">
          Showing {filteredPolicies.length} of {policies.length} policies
        </div>
      </div>

      {/* Policies Data Table or Empty State */}
      {filteredPolicies.length === 0 ? (
        <EmptyState
          title="No policies found"
          description={
            customerFilter === 'ALL'
              ? 'No policies have been issued yet. Use the form above to issue a policy.'
              : 'No policies found for the selected customer.'
          }
        />
      ) : (
        <div className="table-responsive" tabIndex={0} aria-label="Policies directory table">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Policy ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Coverage Period</th>
                <th scope="col">Sum Insured</th>
                <th scope="col">Blocked Amount</th>
                <th scope="col">Remaining Claimable</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => {
                const customerDisplay = policy.customer
                  ? `${policy.customer.displayName || policy.customer.username} (${policy.customer.username})`
                  : '—';
                const isExhausted = policy.remainingClaimableSi <= 0;

                return (
                  <tr key={policy.id || policy.policyId}>
                    <td>
                      <code className="policy-id-text">{policy.policyId}</code>
                    </td>
                    <td>
                      <span className="customer-name-text">{customerDisplay}</span>
                    </td>
                    <td>
                      {formatDate(policy.startDate)} to {formatDate(policy.endDate)}
                    </td>
                    <td>
                      <Money amount={policy.sumInsured} />
                    </td>
                    <td>
                      <Money amount={policy.blockedAmount} />
                    </td>
                    <td>
                      <span className={isExhausted ? 'exhausted-text' : 'remaining-highlight'}>
                        <Money amount={policy.remainingClaimableSi} />
                      </span>
                      {isExhausted && (
                        <span className="badge badge-rejected" style={{ marginLeft: '0.4rem' }}>
                          Exhausted
                        </span>
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

