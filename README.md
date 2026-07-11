# MonsoonMitra 🌧️ — Be Monsoon Ready

An AI-powered monsoon preparedness assistant for Indian cities. Get a personalized monsoon plan powered by **real weather forecasts** and **Gemini AI** — tailored to your household, your city, and your needs.

## Features

- **Real Weather Data** — geocodes any Indian city and fetches 5-day forecast from Open-Meteo (free, no API key required)
- **Smart Alert System** — computes precipitation risk from real data: ≥64mm (red/heavy), ≥15mm (yellow/moderate), <15mm (green/low)
- **AI-Generated Plans** — sends real forecast + household profile to Gemini to generate personalized advice
- **6 Indian Languages** — English, हिन्दी, ಕನ್ನಡ, தமிழ், తెలుగు, বাংলা
- **Emergency Checklist** — interactive checkable items with progress tracking
- **Travel Advisory** — day-by-day travel advice with real precipitation/wind data
- **Safety Guide** — tabbed Before / During / After storm guidance
- **Accessible** — WCAG 2.1 AA compliant with proper aria-labels, keyboard navigation, and screen reader support

## Architecture

```
src/
├── config.js                       # API URLs, thresholds, language options
├── services/
│   ├── weatherService.js           # Geocoding + forecast + alert computation
│   └── aiService.js                # Gemini API integration + JSON parsing
├── components/
│   ├── Header.jsx                  # App branding + language selector
│   ├── InputForm.jsx               # City, family size, household checkboxes
│   ├── AlertBanner.jsx             # Color-coded weather alert with mm figures
│   ├── PreparednessPanel.jsx       # AI-generated preparedness steps
│   ├── Checklist.jsx               # Interactive emergency checklist
│   ├── TravelAdvisory.jsx          # 5-day travel advice with real stats
│   ├── SafetyGuide.jsx             # Tabbed before/during/after guide
│   ├── LoadingSpinner.jsx          # Animated rain cloud loader
│   └── ErrorMessage.jsx            # Friendly error display with dismiss
├── tests/
│   ├── setup.js                    # Vitest + jest-dom setup
│   ├── weatherService.test.js      # Alert threshold unit tests
│   ├── aiService.test.js           # JSON fence stripping tests
│   └── App.test.jsx                # Integration tests (validation, errors, a11y)
├── App.jsx                         # Main orchestrator
├── main.jsx                        # Entry point
└── index.css                       # Full design system
```

## Problem Statement Alignment

| Requirement | Implementation |
|---|---|
| Header with language selector | `Header.jsx` — title "MonsoonMitra 🌧️ — Be Monsoon Ready" + dropdown with 6 languages |
| Input form (city, family, checkboxes) | `InputForm.jsx` — city text (max 100 chars), family size (1–20), 6 checkboxes (elderly, children, pets, two-wheeler, car, ground-floor) |
| Alert banner from real forecast | `AlertBanner.jsx` + `computeAlertLevel()` — sums 48h precipitation; ≥64mm=red, ≥15mm=yellow, <15mm=green; shows real mm |
| Personalized preparedness plan | `PreparednessPanel.jsx` — AI plan steps tailored to household profile |
| Emergency checklist | `Checklist.jsx` — checkable items with progress bar, adapted per profile |
| 5-day travel advisory | `TravelAdvisory.jsx` — day-by-day cards with real precipitation/wind data |
| Safety guide (Before/During/After) | `SafetyGuide.jsx` — three tabs with ARIA tab pattern |
| Geocode city → fetch weather | `weatherService.js` — Open-Meteo geocoding + forecast (free, no key) |
| Send forecast + profile to Gemini | `aiService.js` — Gemini 3.5 Flash with system prompt enforcing JSON schema |
| Strip ```json fences | `stripJsonFences()` in `aiService.js` — exported and unit tested |
| Language changes ALL output | Language name sent to Gemini system prompt: "generate ENTIRELY in {language}" |
| Empty city → inline error | `InputForm.jsx` — validates on submit, shows error, blocks API calls |
| 15s AbortController timeout | Both `weatherService.js` and `aiService.js` use `REQUEST_TIMEOUT_MS` (15000ms) |
| Button disabled while loading | `InputForm.jsx` — `disabled={isLoading}` on submit button |
| Loading spinner | `LoadingSpinner.jsx` — animated rain cloud with status announcement |
| Friendly error handling | `ErrorMessage.jsx` — dismissible error card with helpful messages |
| API key via env only | `config.js` reads `import.meta.env.VITE_GEMINI_API_KEY`; `.env.local` in `.gitignore` |
| No dangerouslySetInnerHTML | All AI output rendered as plain text via `{curly braces}` |
| aria-labels on inputs | Every input, select, button has `aria-label`; results region has `aria-live="polite"` |
| :focus-visible outlines | Global CSS `:focus-visible` rule with 2px accent outline |
| 4.5:1 contrast ratio | Light text (#f1f5f9) on dark backgrounds (#0a0e1a) exceeds 4.5:1 |
| JSDoc on all functions | Every exported and internal function has full JSDoc |
| Clean file structure | `config.js`, `weatherService.js`, `aiService.js`, components split sensibly |
| Tests | Vitest + RTL: 19 tests across 3 files — thresholds, validation, errors, a11y |

## Setup

```bash
# Install dependencies
npm install

# Add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **Open-Meteo API** — free weather data (no API key needed)
- **Gemini 3.5 Flash** — AI plan generation
- **Vitest + React Testing Library** — testing
- **Vanilla CSS** — custom design system with dark theme, glassmorphism, and micro-animations
