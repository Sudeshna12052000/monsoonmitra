/**
 * @fileoverview Preparedness plan panel component.
 * Displays personalized monsoon preparedness steps from AI.
 */

import { memo } from 'react';

/**
 * Displays personalized preparedness plan steps as a numbered list.
 * Memoized since it only re-renders when plan data changes.
 * @param {Object} props
 * @param {string[]} props.plan - Array of preparedness steps.
 * @returns {JSX.Element|null} Returns null when plan is empty.
 */
const PreparednessPanel = memo(function PreparednessPanel({ plan }) {
  if (!plan || plan.length === 0) return null;

  return (
    <section className="dashboard-card" aria-label="My Preparedness Plan">
      <h3 className="card-title">
        <span className="card-icon" aria-hidden="true">📋</span>
        My Preparedness Plan
      </h3>
      <ul className="plan-list">
        {plan.map((step, index) => (
          <li key={index} className="plan-item">
            <span className="plan-number" aria-hidden="true">{index + 1}</span>
            <span className="plan-text">{step}</span>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default PreparednessPanel;
