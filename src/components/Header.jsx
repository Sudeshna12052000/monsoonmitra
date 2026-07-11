/**
 * @fileoverview Header component for MonsoonMitra.
 * Displays app title with branding and a language selector dropdown.
 */

import { memo } from 'react';
import { LANGUAGES } from '../config.js';

/**
 * Header component with app title and language selector.
 * Memoized since it only depends on the selected language code and disabled state.
 * @param {Object} props - Component properties.
 * @param {string} props.language - Currently selected language code.
 * @param {Function} props.onLanguageChange - Callback when language changes.
 * @param {boolean} [props.disabled] - Whether the language selector is disabled.
 * @returns {JSX.Element} The rendered header element.
 */
const Header = memo(function Header({ language, onLanguageChange, disabled = false }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <span className="header-icon" aria-hidden="true">
            🌧️
          </span>
          <div>
            <h1 className="header-title">MonsoonMitra</h1>
            <p className="header-subtitle">Be Monsoon Ready</p>
          </div>
        </div>
        <div className="header-controls">
          <label htmlFor="language-select" className="language-label">
            <span aria-hidden="true">🌐</span>
          </label>
          <select
            id="language-select"
            className="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={disabled}
            aria-label="Select language"
            aria-disabled={disabled}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
});

export default Header;
