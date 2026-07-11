/**
 * @fileoverview Friendly error message component with dismiss action.
 */

import { memo } from 'react';

/**
 * Displays a user-friendly error message with dismiss button.
 * Memoized to avoid re-renders when parent state changes unrelated to error.
 * @param {Object} props
 * @param {string} props.message - Error message to display.
 * @param {Function} props.onDismiss - Callback to dismiss the error.
 * @returns {JSX.Element|null} Returns null when no error message.
 */
const ErrorMessage = memo(function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-container" role="alert" aria-live="assertive">
      <div className="error-card">
        <span className="error-icon" aria-hidden="true">😟</span>
        <div className="error-body">
          <h3 className="error-title">Oops! Something went wrong</h3>
          <p className="error-text">{message}</p>
        </div>
        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error message"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default ErrorMessage;
