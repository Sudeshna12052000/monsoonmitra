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

| Challenge Requirement | How MonsoonMitra Delivers It |
|---|---|
| Personalized preparedness plans | AI plan tailored to family size, elderly, children, pets, vehicle type, and ground-floor homes |
| Weather-aware guidance | Every recommendation is grounded on a live 5-day Open-Meteo forecast for the user's city |
| Emergency checklists | Interactive, checkable emergency checklist with progress tracking, adapted to the household |
| Travel advisories | Day-by-day 5-day travel advice using real precipitation and wind data |
| Safety recommendations | Dedicated Before / During / After tabs — covering severe weather events end to end |
| Multilingual assistance | Entire output generated in the user's chosen language: English, Hindi, Kannada, Tamil, Telugu, Bengali |
| Real-time alerts | Alert banner computed client-side from live 48-hour precipitation (IMD-style: ≥64mm red, ≥15mm yellow) |
| Helps individuals, families & communities | Household-profile-driven personalization for any Indian city |


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
