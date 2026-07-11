/**
 * @fileoverview Unit tests for aiService — stripJsonFences utility.
 */
import { describe, it, expect } from 'vitest';
import { stripJsonFences } from '../services/aiService.js';

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
