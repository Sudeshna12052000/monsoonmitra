/**
 * @fileoverview Results dashboard component for MonsoonMitra.
 * Thin wrapper that renders the alert banner, preparedness steps,
 * interactive checklist, travel advisory, and safety guides.
 */

import { memo } from 'react';
import AlertBanner from './AlertBanner.jsx';
import PreparednessPanel from './PreparednessPanel.jsx';
import Checklist from './Checklist.jsx';
import TravelAdvisory from './TravelAdvisory.jsx';
import SafetyGuide from './SafetyGuide.jsx';

/**
 * Aggregated Dashboard component for results presentation.
 * Memoized to prevent re-renders when parent states change.
 * @param {Object} props - Component properties.
 * @param {import('../types.js').MonsoonPlan & { alert: import('../types.js').WeatherAlert, location: Object, forecast: Object }} props.results - Full results including AI plan and weather data.
 * @param {Function} props.onToggleChecklist - Callback to toggle checklist item completion.
 * @returns {JSX.Element} The rendered dashboard.
 */
const Dashboard = memo(function Dashboard({ results, onToggleChecklist }) {
  return (
    <div
      className="dashboard"
      aria-live="polite"
      role="region"
      aria-label="Monsoon preparedness results"
    >
      {/* 1. Alert Banner */}
      <AlertBanner
        alert={results.alert}
        locationName={`${results.location.name}, ${results.location.country}`}
      />

      {/* 2. Preparedness Plan */}
      <PreparednessPanel plan={results.plan} />

      {/* 3. Emergency Checklist */}
      <Checklist
        items={results.checklist}
        onToggle={onToggleChecklist}
      />

      {/* 4. Travel Advisory */}
      <TravelAdvisory
        advisory={results.travelAdvisory}
        forecast={results.forecast}
      />

      {/* 5. Safety Guide */}
      <SafetyGuide safety={results.safety} />
    </div>
  );
});

export default Dashboard;
