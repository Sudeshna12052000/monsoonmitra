/**
 * @fileoverview Travel advisory component.
 * Shows day-by-day travel advice based on real weather forecast data.
 */

import { memo } from 'react';

/**
 * Displays day-by-day travel advisory cards for next 5 days.
 * Each card shows real precipitation, probability, and wind speed.
 * Memoized since it only re-renders when advisory or forecast data changes.
 * @param {Object} props - Component properties.
 * @param {import('../types.js').TravelAdvisoryDay[]} props.advisory - Travel advisory data.
 * @param {Object} props.forecast - Raw forecast data for precipitation figures.
 * @returns {JSX.Element|null} The rendered travel advisory element, or null if the advisory is empty.
 */
const TravelAdvisory = memo(function TravelAdvisory({ advisory, forecast }) {
  if (!advisory || advisory.length === 0) return null;

  const precipSums = forecast?.daily?.precipitation_sum || [];
  const precipProbs = forecast?.daily?.precipitation_probability_max || [];
  const windSpeeds = forecast?.daily?.wind_speed_10m_max || [];

  return (
    <section className="dashboard-card" aria-label="Travel Advisory">
      <h3 className="card-title">
        <span className="card-icon" aria-hidden="true">🚗</span>
        Travel Advisory
      </h3>
      <div className="travel-grid">
        {advisory.map((entry, index) => {
          const precip = precipSums[index] ?? '—';
          const prob = precipProbs[index] ?? '—';
          const wind = windSpeeds[index] ?? '—';

          return (
            <div key={index} className="travel-card">
              <div className="travel-day-header">
                <span className="travel-day">{entry.day}</span>
                <div className="travel-stats">
                  <span className="travel-stat" title="Precipitation">
                    💧 {typeof precip === 'number' ? `${precip.toFixed(1)}mm` : precip}
                  </span>
                  <span className="travel-stat" title="Rain probability">
                    🌧️ {typeof prob === 'number' ? `${prob}%` : prob}
                  </span>
                  <span className="travel-stat" title="Wind speed">
                    💨 {typeof wind === 'number' ? `${wind.toFixed(1)}km/h` : wind}
                  </span>
                </div>
              </div>
              <p className="travel-advice">{entry.advice}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default TravelAdvisory;
