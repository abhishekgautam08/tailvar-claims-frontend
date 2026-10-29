import React, { useState, useEffect, useRef } from 'react';
import { submitClaim } from '../../api/claims';
import { formatDate, formatMoney } from '../../utils/format';
import Alert from '../Alert';

const ERROR_CODE_MAP = {
  INCIDENT_DATE_OUT_OF_RANGE: 'The incident date is outside the policy coverage period.',
  AMOUNT_EXCEEDS_REMAINING_SI: 'The claim amount exceeds the remaining claimable sum insured.',
  VALIDATION_ERROR: 'Invalid input. Please check the values provided.',
  POLICY_NOT_FOUND: 'The selected policy was not found or is no longer active.'
};

/**
 * ClaimForm Component
 * Allows customers to file a new insurance claim with robust validation,
 * dynamic policy limits, accessibility hooks, and comprehensive error handling.
 */
export default function ClaimForm({
  policies = [],
  selectedPolicyId,
  onSelectPolicyId,
  onSubmitSuccess,
  onPolicyRefreshNeeded,
  formCardRef
}) {
  const [incidentDate, setIncidentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successAlertRef = useRef(null);

  // Derive the currently selected policy
  const selectedPolicy = policies.find((p) => p.policyId === selectedPolicyId) || null;

  // Clear server messages when user updates inputs
  const handlePolicyChange = (e) => {
    const val = e.target.value;
    onSelectPolicyId(val);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.policy) {
      setFieldErrors((prev) => ({ ...prev, policy: undefined }));
    }
  };

  const handleDateChange = (e) => {
    setIncidentDate(e.target.value);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.incidentDate) {
      setFieldErrors((prev) => ({ ...prev, incidentDate: undefined }));
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.amount) {
      setFieldErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  // Validate form before dispatch
  const validateForm = () => {
    const errors = {};

    if (!selectedPolicy) {
      errors.policy = 'Please select a policy.';
    }

    if (!incidentDate) {
      errors.incidentDate = 'Incident date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate)) {
      errors.incidentDate = 'Please enter a valid date in YYYY-MM-DD format.';
    } else if (selectedPolicy) {
      if (incidentDate < selectedPolicy.startDate || incidentDate > selectedPolicy.endDate) {
        errors.incidentDate = `Incident date must be between ${formatDate(selectedPolicy.startDate)} and ${formatDate(selectedPolicy.endDate)}.`;
      }
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      errors.amount = 'Claim amount is required.';
    } else if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
      errors.amount = 'Amount must be a positive number with up to 2 decimal places (e.g. 50000 or 1500.50).';
    } else {
      const numAmount = parseFloat(trimmedAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.amount = 'Amount must be greater than zero.';
      } else if (selectedPolicy && numAmount > selectedPolicy.remainingClaimableSi) {
        errors.amount = `Amount cannot exceed remaining sum insured (${formatMoney(selectedPolicy.remainingClaimableSi)}).`;
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        policyId: selectedPolicy.policyId,
        incidentDate,
        amount: parseFloat(amount.trim())
      };

      const result = await submitClaim(payload);
      const newClaim = result?.claim;
      const claimIdentifier = newClaim?.claimId || 'new';

      setSuccessMessage(`Claim ${claimIdentifier} submitted`);

      // Reset incidentDate and amount, but keep selected policy
      setIncidentDate('');
      setAmount('');
      setFieldErrors({});

      // Notify parent to refetch or update state
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }

      // Accessibility: Move focus to the success alert
      setTimeout(() => {
        if (successAlertRef.current) {
          successAlertRef.current.focus();
        }
      }, 50);
    } catch (err) {
      const friendlyPrefix = ERROR_CODE_MAP[err.code];
      const message = friendlyPrefix
        ? `${friendlyPrefix} (${err.message})`
        : err.message || 'Failed to submit claim. Please try again.';

      setServerError(message);

      // If amount exceeded remaining SI, refresh policy limits immediately
      if (err.code === 'AMOUNT_EXCEEDS_REMAINING_SI' && onPolicyRefreshNeeded) {
        onPolicyRefreshNeeded();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (policies.length === 0) {
    return (
      <div className="claim-form-card" ref={formCardRef}>
        <h2 className="section-title">Submit a Claim</h2>
        <div className="empty-policy-notice">
          <p className="text-muted">
            You do not have any active policies. A claim can only be filed against an active policy issued by an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-form-card" ref={formCardRef}>
      <h2 className="section-title">Submit a Claim</h2>
      <p className="section-subtitle">
        File an insurance claim against an active policy. The amount is immediately blocked upon submission.
      </p>

      {/* Success Notification with Focus Management */}
      {successMessage && (
        <div ref={successAlertRef} tabIndex={-1} className="alert-focus-wrapper">
          <Alert type="success" message={successMessage} />
        </div>
      )}

      {/* Server Error Notification */}
      {serverError && (
        <Alert type="error" message={serverError} />
      )}

      <form onSubmit={handleSubmit} className="claim-form" noValidate>
        {/* Policy Selector */}
        <div className="form-group">
          <label htmlFor="claim-policy" className="form-label">
            Policy <span className="required-star" aria-hidden="true">*</span>
          </label>
          <select
            id="claim-policy"
            className="form-input form-select"
            value={selectedPolicyId || ''}
            onChange={handlePolicyChange}
            aria-invalid={!!fieldErrors.policy}
            aria-describedby={fieldErrors.policy ? 'claim-policy-error' : undefined}
            disabled={isSubmitting}
            required
          >
            <option value="">-- Select a policy --</option>
            {policies.map((pol) => (
              <option key={pol.policyId} value={pol.policyId}>
                {pol.policyId} ({formatDate(pol.startDate)} to {formatDate(pol.endDate)})
              </option>
            ))}
          </select>
          {fieldErrors.policy && (
            <p id="claim-policy-error" className="form-error" role="alert">
              {fieldErrors.policy}
            </p>
          )}
        </div>

        <div className="form-row-2">
          {/* Incident Date */}
          <div className="form-group">
            <label htmlFor="claim-incident-date" className="form-label">
              Incident Date <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="claim-incident-date"
              type="date"
              className="form-input"
              value={incidentDate}
              onChange={handleDateChange}
              min={selectedPolicy ? selectedPolicy.startDate : undefined}
              max={selectedPolicy ? selectedPolicy.endDate : undefined}
              aria-invalid={!!fieldErrors.incidentDate}
              aria-describedby={
                fieldErrors.incidentDate
                  ? 'claim-date-error'
                  : selectedPolicy
                  ? 'claim-date-hint'
                  : undefined
              }
              disabled={isSubmitting || !selectedPolicy}
              required
            />
            {fieldErrors.incidentDate ? (
              <p id="claim-date-error" className="form-error" role="alert">
                {fieldErrors.incidentDate}
              </p>
            ) : selectedPolicy ? (
              <p id="claim-date-hint" className="form-helper-text">
                Coverage: {formatDate(selectedPolicy.startDate)} to {formatDate(selectedPolicy.endDate)}
              </p>
            ) : null}
          </div>

          {/* Claim Amount */}
          <div className="form-group">
            <label htmlFor="claim-amount" className="form-label">
              Claim Amount <span className="required-star" aria-hidden="true">*</span>
            </label>
            <div className="input-rupee-wrapper">
              <span className="rupee-symbol" aria-hidden="true">₹</span>
              <input
                id="claim-amount"
                type="text"
                inputMode="decimal"
                className="form-input form-input-rupee"
                value={amount}
                onChange={handleAmountChange}
                placeholder="e.g. 50000"
                aria-invalid={!!fieldErrors.amount}
                aria-describedby={fieldErrors.amount ? 'claim-amount-error' : 'claim-amount-helper'}
                disabled={isSubmitting || !selectedPolicy}
                required
              />
            </div>
            {fieldErrors.amount && (
              <p id="claim-amount-error" className="form-error" role="alert">
                {fieldErrors.amount}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Remaining Balance Helper */}
        <div id="claim-amount-helper" className="remaining-helper-box">
          {selectedPolicy ? (
            <p className="helper-text">
              Remaining claimable for this policy:{' '}
              <strong className="helper-remaining-si">
                {formatMoney(selectedPolicy.remainingClaimableSi)}
              </strong>
              {selectedPolicy.remainingClaimableSi <= 0 && (
                <span className="helper-exhausted-badge"> (No balance available)</span>
              )}
            </p>
          ) : (
            <p className="helper-text text-muted">
              Select a policy to view remaining claimable sum insured.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting || !selectedPolicy}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" aria-hidden="true" />
                Submitting...
              </span>
            ) : (
              'Submit Claim'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
