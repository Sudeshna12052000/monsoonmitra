/**
 * @fileoverview Main App component for MonsoonMitra.
 * Orchestrates the weather lookup, AI plan generation,
 * and renders the full dashboard.
 */

import { useState } from 'react';
import Header from './components/Header.jsx';
import InputForm from './components/InputForm.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import PreparednessPanel from './components/PreparednessPanel.jsx';
import Checklist from './components/Checklist.jsx';
import TravelAdvisory from './components/TravelAdvisory.jsx';
import SafetyGuide from './components/SafetyGuide.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import { getWeatherData } from './services/weatherService.js';
import { generateMonsoonPlan } from './services/aiService.js';
import { LANGUAGES } from './config.js';

/**
 * Root application component.
 * @returns {JSX.Element}
 */
export default function App() {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  /**
   * Handles form submission: fetches weather and generates AI plan.
   * @param {Object} profile - Household profile from the form.
   */
  const handleSubmit = async (profile) => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Step 1: Geocode city + fetch weather
      const weatherData = await getWeatherData(profile.city);

      // Step 2: Get language name for AI prompt
      const selectedLang = LANGUAGES.find((l) => l.code === language);
      const languageName = selectedLang ? selectedLang.name : 'English';

      // Step 3: Generate AI plan using Gemini
      const aiPlan = await generateMonsoonPlan(
        weatherData.forecast,
        profile,
        weatherData.location,
        languageName
      );

      // Step 4: Set results
      setResults({
        alert: weatherData.alert,
        location: weatherData.location,
        forecast: weatherData.forecast,
        plan: aiPlan.plan,
        checklist: aiPlan.checklist,
        travelAdvisory: aiPlan.travelAdvisory,
        safety: aiPlan.safety,
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className="hero-section">
            <p className="hero-text">
              Get a personalized monsoon preparedness plan powered by real weather forecasts
              and AI — tailored to your household, your city, and your needs.
            </p>
          </section>

          {/* Input Form */}
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Error Message */}
          <ErrorMessage message={error} onDismiss={() => setError('')} />

          {/* Loading Spinner */}
          {isLoading && <LoadingSpinner />}

          {/* Results Dashboard */}
          {results && (
            <div className="dashboard" aria-live="polite" role="region" aria-label="Monsoon preparedness results">
              {/* 1. Alert Banner */}
              <AlertBanner
                alert={results.alert}
                locationName={`${results.location.name}, ${results.location.country}`}
              />

              {/* 2. Preparedness Plan */}
              <PreparednessPanel plan={results.plan} />

              {/* 3. Emergency Checklist */}
              <Checklist items={results.checklist} />

              {/* 4. Travel Advisory */}
              <TravelAdvisory
                advisory={results.travelAdvisory}
                forecast={results.forecast}
              />

              {/* 5. Safety Guide */}
              <SafetyGuide safety={results.safety} />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          MonsoonMitra © {new Date().getFullYear()} — Weather data from{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
            Open-Meteo
          </a>{' '}
          · AI by Gemini
        </p>
      </footer>
    </div>
  );
}
