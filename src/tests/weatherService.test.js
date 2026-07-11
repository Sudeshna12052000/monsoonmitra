/**
 * @fileoverview Unit tests for weatherService — computeAlertLevel thresholds.
 */
import { describe, it, expect } from 'vitest';
import { computeAlertLevel } from '../services/weatherService.js';

/**
 * Helper to build a minimal forecast object with given precipitation sums.
 * @param {number[]} precipSums - Array of daily precipitation sums in mm.
 * @returns {Object} Forecast data shaped like Open-Meteo response.
 */
function makeForecast(precipSums) {
  return { daily: { precipitation_sum: precipSums } };
}

describe('computeAlertLevel', () => {
  it('returns red alert when 48h precipitation >= 64mm', () => {
    const result = computeAlertLevel(makeForecast([40, 25, 5, 2, 1]));
    expect(result.level).toBe('red');
    expect(result.totalMm).toBe(65);
    expect(result.message).toContain('Heavy Rain Alert');
    expect(result.message).toContain('65.0');
  });

  it('returns yellow alert when 48h precipitation >= 15mm and < 64mm', () => {
    const result = computeAlertLevel(makeForecast([10, 10, 3, 1, 0]));
    expect(result.level).toBe('yellow');
    expect(result.totalMm).toBe(20);
    expect(result.message).toContain('Moderate Rain');
    expect(result.message).toContain('20.0');
  });

  it('returns green alert when 48h precipitation < 15mm', () => {
    const result = computeAlertLevel(makeForecast([1, 1, 0, 0, 0]));
    expect(result.level).toBe('green');
    expect(result.totalMm).toBe(2);
    expect(result.message).toContain('Low Risk');
    expect(result.message).toContain('2.0');
  });

  it('returns green with 0mm when precipitation data is empty', () => {
    const result = computeAlertLevel(makeForecast([]));
    expect(result.level).toBe('green');
    expect(result.totalMm).toBe(0);
  });

  it('handles exactly 64mm as red threshold boundary', () => {
    const result = computeAlertLevel(makeForecast([32, 32, 0, 0, 0]));
    expect(result.level).toBe('red');
    expect(result.totalMm).toBe(64);
  });

  it('handles exactly 15mm as yellow threshold boundary', () => {
    const result = computeAlertLevel(makeForecast([10, 5, 0, 0, 0]));
    expect(result.level).toBe('yellow');
    expect(result.totalMm).toBe(15);
  });

  it('handles null precipitation values gracefully', () => {
    const result = computeAlertLevel(makeForecast([null, null, 5]));
    expect(result.level).toBe('green');
    expect(result.totalMm).toBe(0);
  });

  it('handles partial null precipitation values correctly', () => {
    const result = computeAlertLevel(makeForecast([null, 30, 5]));
    expect(result.level).toBe('yellow');
    expect(result.totalMm).toBe(30);
    expect(result.message).toContain('Moderate Rain');
    expect(result.message).toContain('30.0');
  });

  it('only sums first 2 days for 48h window', () => {
    // Day 3-5 have huge values that should be ignored
    const result = computeAlertLevel(makeForecast([3, 4, 100, 200, 300]));
    expect(result.level).toBe('green');
    expect(result.totalMm).toBe(7);
  });
});
