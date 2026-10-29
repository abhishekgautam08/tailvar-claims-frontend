import React from 'react';

export const Alert = ({ type = 'info', message, children, onClose }) => {
  const content = message || children;
  if (!content) return null;

  const role = type === 'error' ? 'alert' : 'status';

  return (
    <div className={`alert alert-${type}`} role={role}>
      <div className="alert-content">{content}</div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;

