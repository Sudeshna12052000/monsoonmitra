/**
 * @fileoverview Application configuration constants for MonsoonMitra.
 * Centralizes API endpoints, thresholds, and language options.
 */

/** Open-Meteo Geocoding API base URL (free, no key required) */
export const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Open-Meteo Forecast API base URL (free, no key required) */
export const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

/** Gemini API base URL */
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

/** Gemini API key from environment variable (never hardcode) */
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** Request timeout in milliseconds for all API calls (weather + AI) */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Number of forecast days to fetch from Open-Meteo */
export const FORECAST_DAYS = 5;

/** Maximum allowed length for city name input */
export const CITY_MAX_LENGTH = 100;

/** Minimum valid family size */
export const FAMILY_SIZE_MIN = 1;

/** Maximum valid family size */
export const FAMILY_SIZE_MAX = 20;

/**
 * Precipitation thresholds (in mm, summed over next 48 hours)
 * for determining alert severity.
 */
export const ALERT_THRESHOLDS = {
  RED: 64,    // >= 64mm = Heavy rain alert
  YELLOW: 15, // >= 15mm = Moderate rain
};

/**
 * Supported languages with their display names and locale codes.
 * @type {Array<{code: string, label: string, name: string}>}
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', name: 'English' },
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
];

/**
 * List of household configuration fields for the UI form.
 * @type {Array<{key: string, id: string, label: string}>}
 */
export const HOUSEHOLD_FIELDS = [
  { key: 'hasElderly', id: 'elderly-checkbox', label: '👴 Elderly at home' },
  { key: 'hasChildren', id: 'children-checkbox', label: '👶 Children' },
  { key: 'hasPets', id: 'pets-checkbox', label: '🐾 Pets' },
  { key: 'hasTwoWheeler', id: 'two-wheeler-checkbox', label: '🏍️ Two-wheeler' },
  { key: 'hasCar', id: 'car-checkbox', label: '🚗 Car' },
  { key: 'isGroundFloor', id: 'ground-floor-checkbox', label: '🏠 Ground-floor home' },
];

