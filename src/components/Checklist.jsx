/**
 * @fileoverview Emergency checklist component with checkable items.
 * Items are adapted to the household profile by the AI.
 */

import { useState } from 'react';

/**
 * Interactive emergency checklist with progress tracking.
 * @param {Object} props
 * @param {Array<{item: string, done: boolean}>} props.items - Checklist items.
 * @returns {JSX.Element}
 */
export default function Checklist({ items }) {
  const [checklistState, setChecklistState] = useState(
    items.map((item) => ({ ...item }))
  );

  /**
   * Toggles a checklist item's done state.
   * @param {number} index - Index of the item to toggle.
   */
  const toggleItem = (index) => {
    setChecklistState((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  const completedCount = checklistState.filter((item) => item.done).length;
  const totalCount = checklistState.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!items || items.length === 0) return null;

  return (
    <section className="dashboard-card" aria-label="Emergency Checklist">
      <h3 className="card-title">
        <span className="card-icon" aria-hidden="true">✅</span>
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
        {checklistState.map((item, index) => (
          <li key={index} className={`checklist-item ${item.done ? 'checklist-done' : ''}`}>
            <label htmlFor={`checklist-item-${index}`} className="checklist-label">
              <input
                id={`checklist-item-${index}`}
                type="checkbox"
                className="checklist-checkbox"
                checked={item.done}
                onChange={() => toggleItem(index)}
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
}
