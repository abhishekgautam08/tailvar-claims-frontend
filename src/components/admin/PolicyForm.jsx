import React, { useState, useRef } from 'react';
import { createPolicy } from '../../api/policies';
import Alert from '../Alert';

/**
 * PolicyForm Component
 * Administrative form to issue a new insurance policy for a customer account.
 */
export default function PolicyForm({ customers = [], onPolicyCreated }) {
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sumInsured, setSumInsured] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successAlertRef = useRef(null);

  // Input change handlers
  const handleCustomerChange = (e) => {
    setCustomerId(e.target.value);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.customerId) {
      setFieldErrors((prev) => ({ ...prev, customerId: undefined }));
    }
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.startDate) {
      setFieldErrors((prev) => ({ ...prev, startDate: undefined }));
    }
    // If end date is now before the new start date, clear or flag
    if (endDate && val && endDate < val) {
      setFieldErrors((prev) => ({
        ...prev,
        endDate: 'End date must not be before start date.'
      }));
    } else if (fieldErrors.endDate) {
      setFieldErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const handleEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.endDate) {
      setFieldErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const handleSumInsuredChange = (e) => {
    setSumInsured(e.target.value);
    setServerError('');
    setSuccessMessage('');
    if (fieldErrors.sumInsured) {
      setFieldErrors((prev) => ({ ...prev, sumInsured: undefined }));
    }
  };

  // Client validation
  const validateForm = () => {
    const errors = {};

    if (!customerId) {
      errors.customerId = 'Customer is required.';
    }

    if (!startDate) {
      errors.startDate = 'Coverage start date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      errors.startDate = 'Please enter a valid start date (YYYY-MM-DD).';
    }

    if (!endDate) {
      errors.endDate = 'Coverage end date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      errors.endDate = 'Please enter a valid end date (YYYY-MM-DD).';
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'End date must not be before start date.';
    }

    const trimmedSI = sumInsured.trim();
    if (!trimmedSI) {
      errors.sumInsured = 'Sum insured is required.';
    } else if (!/^\d+(\.\d{1,2})?$/.test(trimmedSI)) {
      errors.sumInsured = 'Sum insured must be a positive number with up to 2 decimal places (e.g. 500000 or 10000.50).';
    } else {
      const numSI = parseFloat(trimmedSI);
      if (isNaN(numSI) || numSI <= 0) {
        errors.sumInsured = 'Sum insured must be greater than zero.';
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
      const selectedCustomer = customers.find((c) => c.id === customerId);
      const customerLabel = selectedCustomer
        ? selectedCustomer.displayName || selectedCustomer.username
        : 'Customer';

      const created = await createPolicy({
        customerId,
        startDate,
        endDate,
        sumInsured: parseFloat(sumInsured.trim())
      });

      const policyIdentifier = created?.policyId || 'new policy';
      setSuccessMessage(`Policy ${policyIdentifier} created for ${customerLabel}`);

      // Reset form fields
      setCustomerId('');
      setStartDate('');
      setEndDate('');
      setSumInsured('');
      setFieldErrors({});

      // Callback to refetch policies and refresh stats
      if (onPolicyCreated) {
        onPolicyCreated(created);
      }

      // Accessibility: Move focus to the success banner
      setTimeout(() => {
        if (successAlertRef.current) {
          successAlertRef.current.focus();
        }
      }, 50);
    } catch (err) {
      setServerError(err.message || 'Failed to create policy. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="claim-form-card admin-policy-card">
      <div className="section-header-text">
        <h2 className="section-title">Create Policy</h2>
        <p className="section-subtitle">
          Issue a new insurance coverage policy to a registered customer account.
        </p>
      </div>

      {/* Success Banner with programmatic focus */}
      {successMessage && (
        <div ref={successAlertRef} tabIndex={-1} className="alert-focus-wrapper">
          <Alert type="success" message={successMessage} />
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <Alert type="error" message={serverError} />
      )}

      <form onSubmit={handleSubmit} className="claim-form" noValidate>
        {/* Customer Select */}
        <div className="form-group">
          <label htmlFor="policy-customer" className="form-label">
            Customer <span className="required-star" aria-hidden="true">*</span>
          </label>
          <select
            id="policy-customer"
            className="form-input form-select"
            value={customerId}
            onChange={handleCustomerChange}
            aria-invalid={!!fieldErrors.customerId}
            aria-describedby={fieldErrors.customerId ? 'policy-customer-error' : undefined}
            disabled={isSubmitting}
            required
          >
            <option value="">-- Select customer --</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.displayName || cust.username} ({cust.username})
              </option>
            ))}
          </select>
          {fieldErrors.customerId && (
            <p id="policy-customer-error" className="form-error" role="alert">
              {fieldErrors.customerId}
            </p>
          )}
        </div>

        {/* Coverage Dates */}
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="policy-start-date" className="form-label">
              Coverage Start Date <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="policy-start-date"
              type="date"
              className="form-input"
              value={startDate}
              onChange={handleStartDateChange}
              aria-invalid={!!fieldErrors.startDate}
              aria-describedby={fieldErrors.startDate ? 'policy-start-error' : undefined}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.startDate && (
              <p id="policy-start-error" className="form-error" role="alert">
                {fieldErrors.startDate}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="policy-end-date" className="form-label">
              Coverage End Date <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              id="policy-end-date"
              type="date"
              className="form-input"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              aria-invalid={!!fieldErrors.endDate}
              aria-describedby={fieldErrors.endDate ? 'policy-end-error' : undefined}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.endDate && (
              <p id="policy-end-error" className="form-error" role="alert">
                {fieldErrors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Sum Insured */}
        <div className="form-group">
          <label htmlFor="policy-sum-insured" className="form-label">
            Sum Insured <span className="required-star" aria-hidden="true">*</span>
          </label>
          <div className="input-rupee-wrapper">
            <span className="rupee-symbol" aria-hidden="true">₹</span>
            <input
              id="policy-sum-insured"
              type="text"
              inputMode="decimal"
              className="form-input form-input-rupee"
              value={sumInsured}
              onChange={handleSumInsuredChange}
              placeholder="e.g. 500000"
              aria-invalid={!!fieldErrors.sumInsured}
              aria-describedby={fieldErrors.sumInsured ? 'policy-sum-error' : undefined}
              disabled={isSubmitting}
              required
            />
          </div>
          {fieldErrors.sumInsured && (
            <p id="policy-sum-error" className="form-error" role="alert">
              {fieldErrors.sumInsured}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" aria-hidden="true" />
                Creating...
              </span>
            ) : (
              'Create Policy'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

