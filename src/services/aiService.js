/**
 * @fileoverview AI service for MonsoonMitra.
 * Sends forecast data and household profile to Gemini API
 * to generate personalized, structured monsoon preparedness plans.
 * Integrates shape validation, token limits, and automatic query retries.
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
 * @param {boolean} [concise=false] - Whether to append a conciseness instruction to prompt.
 * @returns {string} The user prompt for the model.
 */
function buildUserPrompt(forecast, profile, location, concise = false) {
  let prompt = `Weather Forecast for ${location.name}, ${location.country}:
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

  if (concise) {
    prompt += ' Keep the response concise.';
  }

  return prompt;
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
 * Validates and normalizes the parsed AI response structure.
 * Coerces parameters and applies fallback structures to prevent UI crashes.
 * @param {Object} parsed - The parsed JSON object to validate.
 * @returns {import('../types.js').MonsoonPlan} The sanitized and validated monsoon plan.
 * @throws {Error} If all validated sections of the plan are empty.
 */
export function validatePlan(parsed) {
  const data = parsed || {};

  // Standardize core lists to arrays
  const plan = Array.isArray(data.plan) ? data.plan.map(String) : [];
  const travelAdvisory = Array.isArray(data.travelAdvisory)
    ? data.travelAdvisory.map((item) => ({
        day: String(item?.day || ''),
        advice: String(item?.advice || ''),
      }))
    : [];

  // Coerce every checklist item to target object model: { item, done: false }
  const rawChecklist = Array.isArray(data.checklist) ? data.checklist : [];
  const checklist = rawChecklist.map((item) => {
    const rawVal = item && typeof item === 'object' ? (item.item ?? item) : item;
    return {
      item: String(rawVal ?? ''),
      done: false,
    };
  });

  // Build robust safety tabs object
  const safetyInput = data.safety && typeof data.safety === 'object' ? data.safety : {};
  const safety = {
    before: Array.isArray(safetyInput.before) ? safetyInput.before.map(String) : [],
    during: Array.isArray(safetyInput.during) ? safetyInput.during.map(String) : [],
    after: Array.isArray(safetyInput.after) ? safetyInput.after.map(String) : [],
  };

  // Throw a friendly error only if all sections are empty
  if (
    plan.length === 0 &&
    checklist.length === 0 &&
    travelAdvisory.length === 0 &&
    safety.before.length === 0 &&
    safety.during.length === 0 &&
    safety.after.length === 0
  ) {
    throw new Error('Could not parse the AI response. Response content is empty.');
  }

  return { plan, checklist, travelAdvisory, safety };
}

/**
 * Helper to fetch content from the Gemini API.
 * @param {Object} forecast - Raw weather data.
 * @param {import('../types.js').HouseholdProfile} profile - Demographic details.
 * @param {Object} location - Geolocation data.
 * @param {string} languageName - Target language.
 * @param {boolean} [concise=false] - Conciseness flag for prompt building.
 * @returns {Promise<import('../types.js').MonsoonPlan>}
 */
async function executeApiCall(forecast, profile, location, languageName, concise = false) {
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
            parts: [{ text: buildUserPrompt(forecast, profile, location, concise) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 8192, // Raised to 8192 to prevent token truncation in non-Latin scripts
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `Gemini API request failed (${response.status})`,
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('No response received from Gemini API. Please try again.');
    }

    const cleanedText = stripJsonFences(rawText);
    const parsed = JSON.parse(cleanedText);
    return validatePlan(parsed);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sends forecast and profile data to Gemini API and returns parsed plan.
 * Retries once with a conciseness nudge if JSON parsing or validation fails.
 * @param {Object} forecast - Raw forecast data from Open-Meteo.
 * @param {import('../types.js').HouseholdProfile} profile - Household profile from the form.
 * @param {Object} location - Geocoded location info.
 * @param {string} languageName - Target language name.
 * @returns {Promise<import('../types.js').MonsoonPlan>}
 * @throws {Error} If API call fails, times out, or response cannot be parsed.
 */
export async function generateMonsoonPlan(forecast, profile, location, languageName) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error(
      'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.',
    );
  }

  try {
    // Attempt 1
    return await executeApiCall(forecast, profile, location, languageName, false);
  } catch (error) {
    // If it is a request timeout or endpoint failure, do not retry and throw immediately
    if (
      error.name === 'AbortError' ||
      error.message.includes('timed out') ||
      error.message.includes('API request failed')
    ) {
      throw error;
    }

    // Automatic retry (Attempt 2) with a conciseness nudge
    try {
      return await executeApiCall(forecast, profile, location, languageName, true);
    } catch {
      // Re-throw original parsing/format error if the second attempt also fails
      throw new Error('Could not parse the AI response. Please try again.');
    }
  }
}
