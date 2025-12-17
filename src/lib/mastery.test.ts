import { describe, expect, it } from 'vitest';
import { masteryFromEasiness } from './mastery';

describe('masteryFromEasiness', () => {
  it('returns 0 at the minimum easiness factor', () => {
    expect(masteryFromEasiness(1.3)).toBe(0);
  });

  it('returns 100 at the maximum easiness factor', () => {
    expect(masteryFromEasiness(2.5)).toBe(100);
  });

  it('clamps values below the minimum', () => {
    expect(masteryFromEasiness(0)).toBe(0);
  });

  it('clamps values above the maximum', () => {
    expect(masteryFromEasiness(3)).toBe(100);
  });

  it('normalizes mid-range values', () => {
    expect(masteryFromEasiness(1.9)).toBe(50);
  });
});
