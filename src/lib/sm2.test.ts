import { describe, expect, it } from 'vitest';
import { calculateSm2 } from './sm2';

describe('calculateSm2', () => {
  it('schedules first successful review at 1 day', () => {
    const result = calculateSm2({
      quality: 4,
      easinessFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapseCount: 0
    }, new Date('2024-01-01T00:00:00Z'));

    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.dueAt.toISOString()).toBe('2024-01-02T00:00:00.000Z');
  });

  it('resets interval on low quality', () => {
    const result = calculateSm2({
      quality: 1,
      easinessFactor: 2.4,
      intervalDays: 10,
      repetitions: 3,
      lapseCount: 0
    }, new Date('2024-01-01T00:00:00Z'));

    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.lapseCount).toBe(1);
  });

  it('increases interval after multiple correct reviews', () => {
    const result = calculateSm2({
      quality: 5,
      easinessFactor: 2.5,
      intervalDays: 6,
      repetitions: 2,
      lapseCount: 0
    }, new Date('2024-01-01T00:00:00Z'));

    expect(result.repetitions).toBe(3);
    expect(result.intervalDays).toBeGreaterThanOrEqual(15);
  });
});
