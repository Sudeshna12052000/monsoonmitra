/**
 * @fileoverview Input form component for MonsoonMitra.
 * Collects city name, family size, and household profile checkboxes.
 * Validates city (required, max 100 chars) and family size (positive integer).
 */

import { useState, useCallback } from 'react';
import CheckboxItem from './CheckboxItem.jsx';
import { CITY_MAX_LENGTH, FAMILY_SIZE_MIN, FAMILY_SIZE_MAX, HOUSEHOLD_FIELDS } from '../config.js';

/**
 * Input form for collecting household profile and city.
 * @param {Object} props - Component properties.
 * @param {Function} props.onSubmit - Callback with profile data.
 * @param {boolean} props.isLoading - Whether form should be disabled.
 * @returns {JSX.Element} The rendered form card.
 */
export default function InputForm({ onSubmit, isLoading }) {
  const [city, setCity] = useState('');
  const [familySize, setFamilySize] = useState(2);
  const [profile, setProfile] = useState({
    hasElderly: false,
    hasChildren: false,
    hasPets: false,
    hasTwoWheeler: false,
    hasCar: false,
    isGroundFloor: false,
  });
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

    const clampedFamilySize = Math.max(FAMILY_SIZE_MIN, Math.min(FAMILY_SIZE_MAX, familySize));

    setCityError('');
    onSubmit({
      city: trimmedCity,
      familySize: clampedFamilySize,
      ...profile,
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

  /**
   * Universal change handler for checkbox profile values.
   * useCallback ensures stable reference identity.
   */
  const handleProfileChange = useCallback((key, value) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

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
          {HOUSEHOLD_FIELDS.map((field) => (
            <CheckboxItem
              key={field.key}
              id={field.id}
              label={field.label}
              checked={profile[field.key]}
              onChange={(value) => handleProfileChange(field.key, value)}
              disabled={isLoading}
            />
          ))}
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
