/**
 * @fileoverview Alert banner component for MonsoonMitra.
 * Displays color-coded weather alert based on real precipitation forecast.
 */

import { memo } from 'react';

/** CSS class names mapped to alert severity levels */
const ALERT_CLASSES = {
  red: 'alert-banner alert-red',
  yellow: 'alert-banner alert-yellow',
  green: 'alert-banner alert-green',
};

/** Decorative icons mapped to alert severity levels */
const ALERT_ICONS = {
  red: '🚨',
  yellow: '⚠️',
  green: '✅',
};

/**
 * Alert banner showing computed weather alert level with real mm figures.
 * Memoized since it only re-renders when alert data changes.
 * @param {Object} props - Component properties.
 * @param {Object} props.alert - Alert data with level, message, totalMm.
 * @param {string} props.alert.level - Severity level ('red', 'yellow', 'green').
 * @param {string} props.alert.message - Computed alert message text.
 * @param {number} props.alert.totalMm - Total aggregated precipitation over 48h.
 * @param {string} props.locationName - Display name of the city.
 * @returns {JSX.Element} The rendered alert banner element.
 */
const AlertBanner = memo(function AlertBanner({ alert, locationName }) {
  return (
    <div
      className={ALERT_CLASSES[alert.level]}
      role="alert"
      aria-live="assertive"
    >
      <div className="alert-content">
        <span className="alert-icon" aria-hidden="true">
          {ALERT_ICONS[alert.level]}
        </span>
        <div className="alert-text">
          <strong className="alert-title">{alert.message}</strong>
          <span className="alert-location">📍 {locationName}</span>
        </div>
        <div className="alert-badge">
          <span className="alert-mm">{alert.totalMm.toFixed(1)}</span>
          <span className="alert-mm-label">mm / 48h</span>
        </div>
      </div>
    </div>
  );
});

export default AlertBanner;
