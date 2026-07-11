/**
 * @fileoverview Emergency checklist component with checkable items.
 * Items are adapted to the household profile by the AI.
 */

import { memo, useMemo } from 'react';

/**
 * Interactive emergency checklist with progress tracking.
 * Memoized to prevent re-renders unless items or handler references change.
 * @param {Object} props - Component properties.
 * @param {import('../types.js').ChecklistItem[]} props.items - Checklist items.
 * @param {Function} props.onToggle - Callback function triggered when toggling an item.
 * @returns {JSX.Element|null} The rendered checklist panel, or null if items array is empty.
 */
const Checklist = memo(function Checklist({ items, onToggle }) {
  // Use useMemo to compute derived checklist progress metrics
  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    const total = items ? items.length : 0;
    const completed = items ? items.filter((item) => item.done).length : 0;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    return { completedCount: completed, totalCount: total, progressPercent: percent };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <section className="dashboard-card" aria-label="Emergency Checklist">
      <h3 className="card-title">
        <span className="card-icon" aria-hidden="true">
          ✅
        </span>
        Emergency Checklist
      </h3>

      {/* Progress Bar */}
      <div className="checklist-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${completedCount} of ${totalCount} items completed`}
          />
        </div>
        <span className="progress-text">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Checklist Items */}
      <ul className="checklist">
        {items.map((item, index) => (
          <li key={item.item} className={`checklist-item ${item.done ? 'checklist-done' : ''}`}>
            <label htmlFor={`checklist-item-${index}`} className="checklist-label">
              <input
                id={`checklist-item-${index}`}
                type="checkbox"
                className="checklist-checkbox"
                checked={item.done}
                onChange={() => onToggle(index)}
                aria-label={`${item.item} - ${item.done ? 'completed' : 'not completed'}`}
              />
              <span className="checklist-custom-check" aria-hidden="true">
                {item.done ? '✓' : ''}
              </span>
              <span className="checklist-text">{item.item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default Checklist;
