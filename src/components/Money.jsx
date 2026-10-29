import React from 'react';
import { formatMoney } from '../utils/format';

/**
 * Money Component
 * Formats a numeric rupee amount consistently across the application.
 */
export default function Money({ amount, className = '' }) {
  return (
    <span className={`money ${className}`.trim()}>
      {formatMoney(amount)}
    </span>
  );
}
