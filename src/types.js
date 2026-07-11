/**
 * @fileoverview JSDoc type definitions for the MonsoonMitra application.
 * Centralizes schemas for weather alerts, household profiles, and generated AI plans.
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
 * @typedef {Object} HouseholdProfile
 * @property {string} city - The name of the city.
 * @property {number} familySize - Number of family members in the household.
 * @property {boolean} hasElderly - Whether there are elderly family members.
 * @property {boolean} hasChildren - Whether there are children.
 * @property {boolean} hasPets - Whether there are pets.
 * @property {boolean} hasTwoWheeler - Whether they own a two-wheeler.
 * @property {boolean} hasCar - Whether they own a car.
 * @property {boolean} isGroundFloor - Whether they live on the ground floor.
 */

/**
 * @typedef {Object} WeatherAlert
 * @property {string} level - Severity level ('red', 'yellow', 'green').
 * @property {string} message - Computed alert message text.
 * @property {number} totalMm - Total aggregated precipitation over 48h.
 */

/**
 * @typedef {Object} MonsoonPlan
 * @property {string[]} plan - A general sequential list of personalized preparedness actions.
 * @property {ChecklistItem[]} checklist - A list of emergency checkable items.
 * @property {TravelAdvisoryDay[]} travelAdvisory - A day-by-day travel guide for the next 5 days.
 * @property {SafetyGuideSections} safety - Storm guide divided into before, during, and after sections.
 */

// Export an empty object to satisfy the linter check for non-empty files
export default {};
