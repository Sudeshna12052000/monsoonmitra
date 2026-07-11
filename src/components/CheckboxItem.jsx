/**
 * @fileoverview CheckboxItem component for the MonsoonMitra household form.
 * Displays a styled checkbox element with custom accessibility attributes.
 */

import { memo } from 'react';

/**
 * Individual checkbox item component.
 * Memoized to prevent unnecessary re-renders when sibling checkboxes change.
 * @param {Object} props - Component properties.
 * @param {string} props.id - Unique checkbox HTML ID.
 * @param {string} props.label - Checkbox label text.
 * @param {boolean} props.checked - Whether the checkbox is checked.
 * @param {Function} props.onChange - Change event handler callback.
 * @param {boolean} props.disabled - Whether the checkbox is interactive.
 * @returns {JSX.Element} The rendered checkbox label and input.
 */
const CheckboxItem = memo(function CheckboxItem({ id, label, checked, onChange, disabled }) {
  return (
    <label htmlFor={id} className={`checkbox-label ${checked ? 'checkbox-checked' : ''}`}>
      <input
        id={id}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
      />
      <span className="checkbox-custom" aria-hidden="true">
        {checked ? '✓' : ''}
      </span>
      <span className="checkbox-text">{label}</span>
    </label>
  );
});

export default CheckboxItem;
