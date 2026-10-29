import React from 'react';

/**
 * EmptyState Component
 * Displays a clean placeholder when collections or lists are empty.
 */
export default function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">📋</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

