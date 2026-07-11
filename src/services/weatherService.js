/**
 * @fileoverview Weather service for MonsoonMitra.
 * Handles geocoding and weather forecast fetching from Open-Meteo APIs.
 */

import {
  GEOCODING_API_URL,
  FORECAST_API_URL,
  REQUEST_TIMEOUT_MS,
  FORECAST_DAYS,
  ALERT_THRESHOLDS,
} from '../config.js';

/**
 * Geocodes a city name to latitude/longitude using Open-Meteo Geocoding API.
 * @param {string} city - The city name to geocode.
 * @param {AbortSignal} signal - AbortController signal for timeout.
 * @returns {Promise<{latitude: number, longitude: number, name: string, country: string}>}
 * @throws {Error} If city is not found or request fails.
 */
export async function geocodeCity(city, signal) {
  const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Geocoding request failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find city "${city}". Please check the spelling and try again.`);
  }

  const result = data.results[0];
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
  };
}

/**
 * Fetches weather forecast from Open-Meteo Forecast API.
 * @param {number} latitude - Latitude of the location.
 * @param {number} longitude - Longitude of the location.
 * @param {AbortSignal} signal - AbortController signal for timeout.
 * @returns {Promise<Object>} Raw forecast data from Open-Meteo.
 * @throws {Error} If request fails.
 */
export async function fetchForecast(latitude, longitude, signal) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: 'precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    forecast_days: FORECAST_DAYS.toString(),
    timezone: 'auto',
  });

  const url = `${FORECAST_API_URL}?${params}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Weather forecast request failed (${response.status})`);
  }

  return response.json();
}

/**
 * Computes the alert level based on precipitation sum over next 48 hours.
 * Uses the first 2 days of forecast data.
 * @param {Object} forecastData - Raw forecast data from Open-Meteo.
 * @returns {{level: string, message: string, totalMm: number}}
 */
export function computeAlertLevel(forecastData) {
  const precipSums = forecastData.daily?.precipitation_sum || [];
  const totalMm = precipSums.slice(0, 2).reduce((sum, val) => sum + (val || 0), 0);

  if (totalMm >= ALERT_THRESHOLDS.RED) {
    return {
      level: 'red',
      message: `⛔ Heavy Rain Alert — ${totalMm.toFixed(1)} mm expected in next 48 hours`,
      totalMm,
    };
  }

  if (totalMm >= ALERT_THRESHOLDS.YELLOW) {
    return {
      level: 'yellow',
      message: `⚠️ Moderate Rain Expected — ${totalMm.toFixed(1)} mm in next 48 hours`,
      totalMm,
    };
  }

  return {
    level: 'green',
    message: `✅ Low Risk — Only ${totalMm.toFixed(1)} mm expected in next 48 hours`,
    totalMm,
  };
}

/**
 * Full weather pipeline: geocode city, fetch forecast, compute alert.
 * @param {string} city - City name to look up.
 * @returns {Promise<{location: Object, forecast: Object, alert: Object}>}
 * @throws {Error} If any step fails or times out.
 */
export async function getWeatherData(city) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const location = await geocodeCity(city, controller.signal);
    const forecast = await fetchForecast(location.latitude, location.longitude, controller.signal);
    const alert = computeAlertLevel(forecast);

    return { location, forecast, alert };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
