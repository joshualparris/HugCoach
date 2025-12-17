import { addDays } from './date';

export type Sm2Input = {
  quality: number;
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  lapseCount: number;
};

export type Sm2Result = {
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  lapseCount: number;
  dueAt: Date;
};

export function calculateSm2(input: Sm2Input, now = new Date()): Sm2Result {
  const quality = Math.max(0, Math.min(5, Math.round(input.quality)));
  let easinessFactor = input.easinessFactor;
  let repetitions = input.repetitions;
  let intervalDays = input.intervalDays;
  let lapseCount = input.lapseCount;

  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easinessFactor = Math.max(1.3, easinessFactor + efDelta);

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapseCount += 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easinessFactor));
    }
  }

  return {
    easinessFactor,
    intervalDays,
    repetitions,
    lapseCount,
    dueAt: addDays(now, intervalDays)
  };
}
