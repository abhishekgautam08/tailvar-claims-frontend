import React from 'react';

/**
 * StatusBadge Component
 * Renders claim status badges with distinctive colors and accessible styling.
 * Supports: SUBMITTED (amber), APPROVED (emerald), REJECTED (rose)
 */
export default function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toUpperCase();

  let className = 'badge badge-default';
  let label = normalizedStatus || 'UNKNOWN';

  switch (normalizedStatus) {
    case 'SUBMITTED':
      className = 'badge badge-submitted';
      label = 'Submitted';
      break;
    case 'APPROVED':
      className = 'badge badge-approved';
      label = 'Approved';
      break;
    case 'REJECTED':
      className = 'badge badge-rejected';
      label = 'Rejected';
      break;
    default:
      break;
  }

  return (
    <span className={className} data-status={normalizedStatus}>
      {label}
    </span>
  );
}
