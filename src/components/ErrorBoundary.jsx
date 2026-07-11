/**
 * @fileoverview Error boundary class component for MonsoonMitra.
 * Catches runtime errors in child components and displays a friendly recovery UI.
 */

import { Component } from 'react';

/**
 * ErrorBoundary class component to catch JS errors and prevent crash of whole UI.
 * @extends {Component}
 */
export default class ErrorBoundary extends Component {
  /**
   * Initializes ErrorBoundary with initial state.
   * @param {Object} props - Component properties.
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Updates state so the next render shows the fallback UI.
   * @returns {{hasError: boolean}} The updated error state.
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * Catches errors in child components and triggers recovery actions.
   * @param {Error} _error - The caught runtime error (prefixed with _ to satisfy unused var linter rule).
   * @param {import('react').ErrorInfo} _errorInfo - Diagnostics info about the component stack.
   * @returns {void}
   */
  componentDidCatch(_error, _errorInfo) {
    // Unused variables or debugging logic removed, error logs avoided to keep console clean
  }

  /**
   * Renders fallback UI if error has occurred, otherwise renders children.
   * @returns {import('react').ReactNode} React elements to render.
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" role="alert" aria-live="assertive">
          <div className="error-card">
            <span className="error-icon" aria-hidden="true">
              😟
            </span>
            <div className="error-body">
              <h3 className="error-title">Something went wrong</h3>
              <p className="error-text">
                An unexpected error has occurred. Please refresh the page to restart the
                application.
              </p>
            </div>
            <button
              className="error-dismiss"
              onClick={() => window.location.reload()}
              aria-label="Refresh application"
            >
              🔄
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
