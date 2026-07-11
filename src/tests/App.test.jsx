/**
 * @fileoverview Integration tests for App component — form validation,
 * loading states, and error handling with mocked services.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App.jsx';

// Mock both service modules
vi.mock('../services/weatherService.js', () => ({
  getWeatherData: vi.fn(),
}));
vi.mock('../services/aiService.js', () => ({
  generateMonsoonPlan: vi.fn(),
}));

import { getWeatherData } from '../services/weatherService.js';
import { generateMonsoonPlan } from '../services/aiService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App — form validation', () => {
  it('shows inline error and makes no API calls when city is empty', async () => {
    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/please enter a city name/i)).toBeInTheDocument();
    expect(getWeatherData).not.toHaveBeenCalled();
    expect(generateMonsoonPlan).not.toHaveBeenCalled();
  });

  it('shows inline error when city is only whitespace', async () => {
    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    fireEvent.change(cityInput, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/please enter a city name/i)).toBeInTheDocument();
    expect(getWeatherData).not.toHaveBeenCalled();
  });
});

describe('App — API failure handling', () => {
  it('renders friendly error when weather API fails', async () => {
    getWeatherData.mockRejectedValue(new Error('Could not find city "XYZ"'));

    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    fireEvent.change(cityInput, { target: { value: 'XYZ' } });

    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/could not find city/i)).toBeInTheDocument();
  });

  it('renders friendly error when AI service fails', async () => {
    getWeatherData.mockResolvedValue({
      location: { name: 'Mumbai', country: 'India' },
      forecast: { daily: { precipitation_sum: [5, 3] } },
      alert: { level: 'green', message: 'Low risk', totalMm: 8 },
    });
    generateMonsoonPlan.mockRejectedValue(new Error('AI request timed out. Please try again.'));

    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });

    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/ai request timed out/i)).toBeInTheDocument();
  });
});

describe('App — successful flow', () => {
  it('renders dashboard with all sections after successful API calls', async () => {
    getWeatherData.mockResolvedValue({
      location: { name: 'Mumbai', country: 'India' },
      forecast: {
        daily: {
          precipitation_sum: [40, 30, 10, 5, 2],
          precipitation_probability_max: [90, 80, 60, 40, 20],
          wind_speed_10m_max: [25, 20, 15, 10, 8],
        },
      },
      alert: {
        level: 'red',
        message: '⛔ Heavy Rain Alert — 70.0 mm expected in next 48 hours',
        totalMm: 70,
      },
    });
    generateMonsoonPlan.mockResolvedValue({
      plan: ['Stock emergency supplies', 'Charge devices'],
      checklist: [
        { item: 'First aid kit', done: false },
        { item: 'Flashlight', done: false },
      ],
      travelAdvisory: [{ day: 'Monday', advice: 'Avoid travel' }],
      safety: { before: ['Seal windows'], during: ['Stay indoors'], after: ['Check for damage'] },
    });

    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });

    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });
    fireEvent.click(submitBtn);

    // Wait for results to appear
    expect(await screen.findByText(/heavy rain alert/i)).toBeInTheDocument();
    expect(screen.getByText(/stock emergency supplies/i)).toBeInTheDocument();
    expect(screen.getByText(/first aid kit/i)).toBeInTheDocument();
    expect(screen.getByText(/avoid travel/i)).toBeInTheDocument();
    expect(screen.getByText(/seal windows/i)).toBeInTheDocument();
  });
});

describe('App — caching and cache pollution prevention', () => {
  it('prevents cache pollution by deep-copying cached plans', async () => {
    getWeatherData.mockResolvedValue({
      location: { name: 'Mumbai', country: 'India' },
      forecast: { daily: { precipitation_sum: [10, 10] } },
      alert: { level: 'yellow', message: 'Moderate rain', totalMm: 20 },
    });
    generateMonsoonPlan.mockResolvedValue({
      plan: ['Avoid low areas'],
      checklist: [{ item: 'Raincoat', done: false }],
      travelAdvisory: [],
      safety: { before: [], during: [], after: [] },
    });

    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    const submitBtn = screen.getByRole('button', { name: /get my monsoon/i });

    // Submit first time
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    fireEvent.click(submitBtn);

    // Wait for checklist item to render and verify it is unchecked
    const checkbox = await screen.findByLabelText(/raincoat - not completed/i);
    expect(checkbox).not.toBeChecked();

    // Toggle checklist item to completed
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Re-submit identical request to trigger cache hit
    fireEvent.click(submitBtn);

    // The regenerated checkbox must arrive unchecked again (no pollution of cache reference)
    const freshCheckbox = await screen.findByLabelText(/raincoat - not completed/i);
    expect(freshCheckbox).not.toBeChecked();

    // Services should have only been invoked once due to caching
    expect(getWeatherData).toHaveBeenCalledTimes(1);
    expect(generateMonsoonPlan).toHaveBeenCalledTimes(1);
  });
});

describe('App — accessibility', () => {
  it('has aria-live region for results', async () => {
    getWeatherData.mockResolvedValue({
      location: { name: 'Delhi', country: 'India' },
      forecast: { daily: { precipitation_sum: [2, 1] } },
      alert: { level: 'green', message: 'Low risk', totalMm: 3 },
    });
    generateMonsoonPlan.mockResolvedValue({
      plan: ['Stay prepared'],
      checklist: [{ item: 'Water bottles', done: false }],
      travelAdvisory: [{ day: 'Today', advice: 'Safe to travel' }],
      safety: { before: ['Check drains'], during: ['Monitor news'], after: ['Inspect roof'] },
    });

    render(<App />);

    const cityInput = screen.getByLabelText(/enter your city name/i);
    fireEvent.change(cityInput, { target: { value: 'Delhi' } });
    fireEvent.click(screen.getByRole('button', { name: /get my monsoon/i }));

    await waitFor(() => {
      const resultsRegion = screen.getByRole('region', { name: /monsoon preparedness results/i });
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('has aria-label on language selector', () => {
    render(<App />);
    const langSelect = screen.getByLabelText(/select language/i);
    expect(langSelect).toBeInTheDocument();
  });
});
