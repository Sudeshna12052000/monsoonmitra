/**
 * @fileoverview Unit tests for aiService — stripJsonFences, validatePlan, and automatic API retries.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stripJsonFences, validatePlan, generateMonsoonPlan } from '../services/aiService.js';

describe('stripJsonFences', () => {
  it('removes ```json ... ``` wrappers', () => {
    const input = '```json\n{"plan": []}\n```';
    expect(stripJsonFences(input)).toBe('{"plan": []}');
  });

  it('removes bare ``` ... ``` wrappers', () => {
    const input = '```\n{"plan": []}\n```';
    expect(stripJsonFences(input)).toBe('{"plan": []}');
  });

  it('returns clean JSON unchanged', () => {
    const input = '{"plan": []}';
    expect(stripJsonFences(input)).toBe('{"plan": []}');
  });

  it('handles extra whitespace around fences', () => {
    const input = '  ```json\n  {"plan": []}  \n```  ';
    const result = stripJsonFences(input);
    expect(result).toContain('"plan"');
    expect(result).not.toContain('```');
  });
});

describe('validatePlan', () => {
  it('handles missing safety key by inserting empty safety arrays', () => {
    const input = {
      plan: ['Step 1'],
      checklist: [{ item: 'Pack bag', done: false }],
      travelAdvisory: [{ day: 'Mon', advice: 'Safe' }],
    };
    const validated = validatePlan(input);
    expect(validated.safety).toEqual({ before: [], during: [], after: [] });
    expect(validated.plan).toEqual(['Step 1']);
  });

  it('coerces checklist of plain strings to checklist objects with done: false', () => {
    const input = {
      plan: ['Step 1'],
      checklist: ['Bottled water', 'Batteries'],
      travelAdvisory: [],
      safety: { before: [], during: [], after: [] },
    };
    const validated = validatePlan(input);
    expect(validated.checklist).toEqual([
      { item: 'Bottled water', done: false },
      { item: 'Batteries', done: false },
    ]);
  });

  it('throws friendly error if all generated sections are empty', () => {
    const input = {
      plan: [],
      checklist: [],
      travelAdvisory: [],
      safety: { before: [], during: [], after: [] },
    };
    expect(() => validatePlan(input)).toThrow(/empty/i);
  });
});

describe('generateMonsoonPlan - automatic retry', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-key');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('calls fetch twice and returns plan on second try if first try returns malformed JSON', async () => {
    let callCount = 0;
    
    // Mock fetch to simulate dynamic responses for retry validation
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // Return malformed JSON response
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'This is not valid JSON string' }] } }],
          }),
        };
      } else {
        // Return valid JSON response
        return {
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    plan: ['Retry worked'],
                    checklist: [{ item: 'Flashlight', done: false }],
                    travelAdvisory: [],
                    safety: { before: [], during: [], after: [] },
                  }),
                }],
              },
            }],
          }),
        };
      }
    });

    const forecast = { daily: {} };
    const profile = { city: 'Pune', familySize: 4 };
    const location = { name: 'Pune', country: 'India' };

    const plan = await generateMonsoonPlan(forecast, profile, location, 'English');

    expect(callCount).toBe(2);
    expect(plan.plan).toEqual(['Retry worked']);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
