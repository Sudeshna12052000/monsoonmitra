/**
 * @fileoverview Full-screen loading overlay with animated spinner.
 */

/**
 * Loading spinner overlay shown during API calls.
 * @returns {JSX.Element} The rendered loading spinner interface.
 */
export default function LoadingSpinner() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-animation">
          <div className="rain-cloud" aria-hidden="true">
            <span className="cloud-icon">🌧️</span>
            <div className="rain-drops">
              <span className="drop drop-1">💧</span>
              <span className="drop drop-2">💧</span>
              <span className="drop drop-3">💧</span>
            </div>
          </div>
        </div>
        <p className="loading-text">Preparing your monsoon plan…</p>
        <p className="loading-subtext">Fetching weather data & generating personalized advice</p>
      </div>
    </div>
  );
}
