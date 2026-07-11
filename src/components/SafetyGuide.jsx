/**
 * @fileoverview Safety guide component with tabbed before/during/after sections.
 * Uses proper ARIA tab pattern for keyboard navigation.
 */

import { useState, memo } from 'react';

/** Tab definitions for the safety guide sections */
const SAFETY_TABS = [
  { key: 'before', label: '🛡️ Before' },
  { key: 'during', label: '🌊 During' },
  { key: 'after', label: '☀️ After' },
];

/**
 * Tabbed safety guide showing before, during, and after storm advice.
 * Memoized since it only re-renders when safety tips data changes.
 * @param {Object} props - Component properties.
 * @param {import('../types.js').SafetyGuideSections} props.safety - Safety data with before, during, after arrays.
 * @returns {JSX.Element|null} The rendered safety guide, or null if safety data is missing.
 */
const SafetyGuide = memo(function SafetyGuide({ safety }) {
  const [activeTab, setActiveTab] = useState('before');

  if (!safety) return null;

  const activeData = safety[activeTab] || [];

  return (
    <section className="dashboard-card" aria-label="Safety Guide">
      <h3 className="card-title">
        <span className="card-icon" aria-hidden="true">
          🛡️
        </span>
        Safety Guide
      </h3>

      {/* Tab Navigation */}
      <div className="tabs" role="tablist" aria-label="Safety guide sections">
        {SAFETY_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tab-content"
      >
        {activeData.length > 0 ? (
          <ul className="safety-list">
            {activeData.map((tip) => (
              <li key={tip} className="safety-item">
                <span className="safety-bullet" aria-hidden="true">
                  ●
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="safety-empty">No tips available for this section.</p>
        )}
      </div>
    </section>
  );
});

export default SafetyGuide;
