/**
 * @fileoverview Input form component for MonsoonMitra.
 * Collects city name, family size, and household profile checkboxes.
 * Validates city (required, max 100 chars) and family size (positive integer).
 */

import { useState, memo } from 'react';
import { CITY_MAX_LENGTH, FAMILY_SIZE_MIN, FAMILY_SIZE_MAX } from '../config.js';

/**
 * Input form for collecting household profile and city.
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback with profile data.
 * @param {boolean} props.isLoading - Whether form should be disabled.
 * @returns {JSX.Element}
 */
export default function InputForm({ onSubmit, isLoading }) {
  const [city, setCity] = useState('');
  const [familySize, setFamilySize] = useState(2);
  const [hasElderly, setHasElderly] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [hasTwoWheeler, setHasTwoWheeler] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [isGroundFloor, setIsGroundFloor] = useState(false);
  const [cityError, setCityError] = useState('');

  /**
   * Handles form submission with validation.
   * Empty city or exceeding max length blocks submission with inline error.
   * Family size is clamped to valid range.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setCityError('Please enter a city name');
      return;
    }

    if (trimmedCity.length > CITY_MAX_LENGTH) {
      setCityError(`City name must be ${CITY_MAX_LENGTH} characters or fewer`);
      return;
    }

    const clampedFamilySize = Math.max(
      FAMILY_SIZE_MIN,
      Math.min(FAMILY_SIZE_MAX, familySize)
    );

    setCityError('');
    onSubmit({
      city: trimmedCity,
      familySize: clampedFamilySize,
      hasElderly,
      hasChildren,
      hasPets,
      hasTwoWheeler,
      hasCar,
      isGroundFloor,
    });
  };

  /**
   * Handles city input changes with max-length enforcement.
   * @param {Event} e - Input change event.
   */
  const handleCityChange = (e) => {
    const value = e.target.value.slice(0, CITY_MAX_LENGTH);
    setCity(value);
    if (cityError) setCityError('');
  };

  /**
   * Handles family size input changes with positive-number enforcement.
   * @param {Event} e - Input change event.
   */
  const handleFamilySizeChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (Number.isNaN(parsed) || parsed < FAMILY_SIZE_MIN) {
      setFamilySize(FAMILY_SIZE_MIN);
    } else if (parsed > FAMILY_SIZE_MAX) {
      setFamilySize(FAMILY_SIZE_MAX);
    } else {
      setFamilySize(parsed);
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit} noValidate>
      <div className="form-card">
        <h2 className="form-title">
          <span className="form-title-icon">📍</span>
          Tell Us About Your Household
        </h2>

        <div className="form-grid">
          {/* City Input */}
          <div className="form-group form-group-city">
            <label htmlFor="city-input" className="form-label">
              City
            </label>
            <input
              id="city-input"
              type="text"
              className={`form-input ${cityError ? 'form-input-error' : ''}`}
              placeholder="e.g., Mumbai, Chennai, Bengaluru"
              value={city}
              onChange={handleCityChange}
              maxLength={CITY_MAX_LENGTH}
              disabled={isLoading}
              aria-label="Enter your city name"
              aria-describedby={cityError ? 'city-error' : undefined}
              aria-invalid={!!cityError}
              autoComplete="off"
            />
            {cityError && (
              <span id="city-error" className="form-error" role="alert">
                {cityError}
              </span>
            )}
          </div>

          {/* Family Size */}
          <div className="form-group">
            <label htmlFor="family-size-input" className="form-label">
              Family Size
            </label>
            <input
              id="family-size-input"
              type="number"
              className="form-input"
              min={FAMILY_SIZE_MIN}
              max={FAMILY_SIZE_MAX}
              value={familySize}
              onChange={handleFamilySizeChange}
              disabled={isLoading}
              aria-label="Number of family members"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="checkbox-grid">
          <CheckboxItem
            id="elderly-checkbox"
            label="👴 Elderly at home"
            checked={hasElderly}
            onChange={setHasElderly}
            disabled={isLoading}
          />
          <CheckboxItem
            id="children-checkbox"
            label="👶 Children"
            checked={hasChildren}
            onChange={setHasChildren}
            disabled={isLoading}
          />
          <CheckboxItem
            id="pets-checkbox"
            label="🐾 Pets"
            checked={hasPets}
            onChange={setHasPets}
            disabled={isLoading}
          />
          <CheckboxItem
            id="two-wheeler-checkbox"
            label="🏍️ Two-wheeler"
            checked={hasTwoWheeler}
            onChange={setHasTwoWheeler}
            disabled={isLoading}
          />
          <CheckboxItem
            id="car-checkbox"
            label="🚗 Car"
            checked={hasCar}
            onChange={setHasCar}
            disabled={isLoading}
          />
          <CheckboxItem
            id="ground-floor-checkbox"
            label="🏠 Ground-floor home"
            checked={isGroundFloor}
            onChange={setIsGroundFloor}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading}
          aria-label="Get my monsoon preparedness plan"
        >
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner" aria-hidden="true"></span>
              Generating Your Plan…
            </span>
          ) : (
            <>
              <span aria-hidden="true">🌊</span> Get My Monsoon Plan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Individual checkbox item component.
 * Memoized to prevent unnecessary re-renders when sibling checkboxes change.
 * @param {Object} props
 * @param {string} props.id - Unique checkbox ID.
 * @param {string} props.label - Checkbox label text.
 * @param {boolean} props.checked - Whether checked.
 * @param {Function} props.onChange - Change handler.
 * @param {boolean} props.disabled - Whether disabled.
 * @returns {JSX.Element}
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
