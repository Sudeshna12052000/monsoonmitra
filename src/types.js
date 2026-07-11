/**
 * @fileoverview JSDoc type definitions for the MonsoonMitra application.
 * Defines the schema of the generated plan response from Gemini AI.
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} item - The task or item description.
 * @property {boolean} done - The completion status.
 */

/**
 * @typedef {Object} TravelAdvisoryDay
 * @property {string} day - Day of the week or date label (e.g., "Monday").
 * @property {string} advice - Recommendations for travel based on the weather.
 */

/**
 * @typedef {Object} SafetyGuideSections
 * @property {string[]} before - Tips to execute before the storm starts.
 * @property {string[]} during - Tips to execute during the storm.
 * @property {string[]} after - Tips to execute after the storm has passed.
 */

/**
 * @typedef {Object} MonsoonPlanResponse
 * @property {string[]} plan - A general sequential list of personalized preparedness actions.
 * @property {ChecklistItem[]} checklist - A list of emergency checkable items.
 * @property {TravelAdvisoryDay[]} travelAdvisory - A day-by-day travel guide for the next 5 days.
 * @property {SafetyGuideSections} safety - Storm guide divided into before, during, and after sections.
 */

// Export an empty object to satisfy the linter check for non-empty files
export default {};
