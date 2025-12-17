export function masteryFromEasiness(easinessFactor: number): number {
  const minEf = 1.3;
  const maxEf = 2.5;
  const normalized = (easinessFactor - minEf) / (maxEf - minEf);
  const percent = Math.max(0, Math.min(1, normalized)) * 100;
  return Math.round(percent);
}
