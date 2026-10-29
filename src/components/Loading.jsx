import React from 'react';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;

