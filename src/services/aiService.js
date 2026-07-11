/**
 * @fileoverview AI service for MonsoonMitra.
 * Sends forecast data and household profile to Gemini API
 * to generate personalized monsoon preparedness plans.
 */

import { GEMINI_API_URL, GEMINI_API_KEY, REQUEST_TIMEOUT_MS } from '../config.js';

/**
 * Builds the system prompt for the Gemini API.
 * @param {string} languageName - Full name of the target language (e.g., "Hindi").
 * @returns {string} The system instruction for the model.
 */
function buildSystemPrompt(languageName) {
  return `You are MonsoonMitra, a monsoon preparedness expert for Indian cities. Using ONLY the provided real weather forecast and household profile, generate the response ENTIRELY in ${languageName}. Respond ONLY in valid JSON, no markdown fences, schema:
{ "plan": [string], "checklist": [{"item": string, "done": false}], "travelAdvisory": [{"day": string, "advice": string}], "safety": {"before": [string], "during": [string], "after": [string]} }
Be specific to the household (elderly -> medicines/mobility, pets -> pet food, two-wheeler -> waterlogging warnings, ground floor -> flooding prep).
Never invent weather data beyond what is provided.`;
}

/**
 * Builds the user prompt with forecast data and household profile.
 * @param {Object} forecast - Raw forecast data from Open-Meteo.
 * @param {import('../types.js').HouseholdProfile} profile - Household profile from the form.
 * @param {Object} location - Geocoded location info.
 * @returns {string} The user prompt for the model.
 */
function buildUserPrompt(forecast, profile, location) {
  return `Weather Forecast for ${location.name}, ${location.country}:
${JSON.stringify(forecast.daily, null, 2)}

Household Profile:
- City: ${location.name}
- Family size: ${profile.familySize}
- Elderly at home: ${profile.hasElderly ? 'Yes' : 'No'}
- Children: ${profile.hasChildren ? 'Yes' : 'No'}
- Pets: ${profile.hasPets ? 'Yes' : 'No'}
- Two-wheeler: ${profile.hasTwoWheeler ? 'Yes' : 'No'}
- Car: ${profile.hasCar ? 'Yes' : 'No'}
- Ground-floor home: ${profile.isGroundFloor ? 'Yes' : 'No'}

Generate a comprehensive monsoon preparedness response.`;
}

/**
 * Strips markdown JSON fences from a string if present.
 * Handles both ```json and bare ``` wrappers.
 * @param {string} text - Raw response text from the API.
 * @returns {string} Cleaned text ready for JSON.parse.
 */
export function stripJsonFences(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Sends forecast and profile data to Gemini API and returns parsed plan.
 * @param {Object} forecast - Raw forecast data from Open-Meteo.
 * @param {import('../types.js').HouseholdProfile} profile - Household profile from the form.
 * @param {Object} location - Geocoded location info.
 * @param {string} languageName - Target language name.
 * @returns {Promise<import('../types.js').MonsoonPlan>}
 * @throws {Error} If API call fails or response cannot be parsed.
 */
export async function generateMonsoonPlan(forecast, profile, location, languageName) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(languageName) }],
        },
        contents: [
          {
            parts: [{ text: buildUserPrompt(forecast, profile, location) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `Gemini API request failed (${response.status})`
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('No response received from Gemini API. Please try again.');
    }

    const cleanedText = stripJsonFences(rawText);

    try {
      return JSON.parse(cleanedText);
    } catch {
      throw new Error('Could not parse the AI response. Please try again.');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
