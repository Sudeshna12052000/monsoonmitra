/**
 * @fileoverview Main App component for MonsoonMitra.
 * Orchestrates the weather lookup, AI plan generation,
 * caching of weather results, and delegates rendering to a lazy-loaded Dashboard.
 */

import { useState, useCallback, useRef, lazy, Suspense } from 'react';
import Header from './components/Header.jsx';
import InputForm from './components/InputForm.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import { getWeatherData } from './services/weatherService.js';
import { generateMonsoonPlan } from './services/aiService.js';
import { LANGUAGES } from './config.js';

// Lazy-load the results dashboard component to keep initial bundle small
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));

/**
 * Root application component.
 * @returns {JSX.Element} The rendered application component.
 */
export default function App() {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // Ref to cache the last weather result keyed by lowercased city name
  const weatherCacheRef = useRef({});

  // Ref to cache the generated AI plans keyed by request parameters string
  const planCacheRef = useRef({});

  /**
   * Handles language changes from the header selector.
   * Wrapped in useCallback to preserve reference identity for memoized Header.
   * @type {Function}
   */
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  /**
   * Handles form submission: checks caches or fetches weather, then generates AI plan.
   * Wrapped in useCallback to preserve reference identity for memoized InputForm.
   * @type {Function}
   */
  const handleSubmit = useCallback(async (profile) => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const cityKey = profile.city.trim().toLowerCase();
      
      // Build unique cache key matching exact submission inputs
      const requestCacheKey = JSON.stringify({
        city: cityKey,
        profile: {
          familySize: profile.familySize,
          hasElderly: profile.hasElderly,
          hasChildren: profile.hasChildren,
          hasPets: profile.hasPets,
          hasTwoWheeler: profile.hasTwoWheeler,
          hasCar: profile.hasCar,
          isGroundFloor: profile.isGroundFloor,
        },
        language,
      });

      // Level 2 Cache check: Reuse fully generated plan if identical inputs are submitted
      if (planCacheRef.current[requestCacheKey]) {
        setResults(structuredClone(planCacheRef.current[requestCacheKey]));
        setIsLoading(false);
        return;
      }

      let weatherData;

      // Level 1 Cache check: Reuse weather results for the same city to bypass geocoding
      if (weatherCacheRef.current[cityKey]) {
        weatherData = weatherCacheRef.current[cityKey];
      } else {
        weatherData = await getWeatherData(profile.city);
        weatherCacheRef.current[cityKey] = weatherData;
      }

      // Get full language name for AI prompt context
      const selectedLang = LANGUAGES.find((l) => l.code === language);
      const languageName = selectedLang ? selectedLang.name : 'English';

      // Generate the personalized plan using Gemini AI
      const aiPlan = await generateMonsoonPlan(
        weatherData.forecast,
        profile,
        weatherData.location,
        languageName
      );

      const finalResults = {
        alert: weatherData.alert,
        location: weatherData.location,
        forecast: weatherData.forecast,
        plan: aiPlan.plan,
        checklist: aiPlan.checklist,
        travelAdvisory: aiPlan.travelAdvisory,
        safety: aiPlan.safety,
      };

      // Populate plan cache
      planCacheRef.current[requestCacheKey] = structuredClone(finalResults);
      setResults(finalResults);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  /**
   * Toggles an item on the emergency checklist.
   * Wrapped in useCallback to preserve reference identity for memoized Checklist.
   * @type {Function}
   */
  const handleToggleChecklist = useCallback((index) => {
    setResults((prev) => {
      if (!prev) return prev;
      const updatedChecklist = prev.checklist.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      );
      return { ...prev, checklist: updatedChecklist };
    });
  }, []);

  /**
   * Dismisses the active error card.
   * Wrapped in useCallback to preserve reference identity for memoized ErrorMessage.
   * @type {Function}
   */
  const handleDismissError = useCallback(() => {
    setError('');
  }, []);

  return (
    <div className="app">
      <Header language={language} onLanguageChange={handleLanguageChange} disabled={isLoading} />

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
          <ErrorMessage message={error} onDismiss={handleDismissError} />

          {/* Loading Spinner */}
          {isLoading && <LoadingSpinner />}

          {/* Results Dashboard - lazy loaded with Suspense boundary */}
          {results && (
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard
                results={results}
                onToggleChecklist={handleToggleChecklist}
              />
            </Suspense>
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
