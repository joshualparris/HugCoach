import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  quizAttempt: {
    create: vi.fn(),
    update: vi.fn()
  },
  questionAttempt: {
    create: vi.fn()
  },
  reviewItem: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  ritualLog: {
    upsert: vi.fn()
  }
}));

const recordSessionMock = vi.hoisted(() => vi.fn());
const awardRitualLogMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    xpEarned: 80,
    sparksEarned: 8,
    criticalSuccess: false,
    levelUp: false,
    level: 1,
    title: 'Steady Starter'
  })
);

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/session', () => ({ recordSession: recordSessionMock }));
vi.mock('@/lib/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/date')>();
  return {
    ...actual,
    todayString: () => '2025-01-02'
  };
});
vi.mock('@/lib/gamification', () => ({ awardRitualLog: awardRitualLogMock }));

import { POST as quizAnswer } from './quiz/answer/route';
import { POST as reviewAnswer } from './review/answer/route';
import { POST as ritualLog } from './rituals/log/route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API routes', () => {
  it('quiz answer returns 400 for missing fields', async () => {
    const response = await quizAnswer(
      new Request('http://localhost/api/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
  });

  it('quiz answer returns 200 on success', async () => {
    prismaMock.quizAttempt.create.mockResolvedValue({ id: 'quiz-1' });
    prismaMock.questionAttempt.create.mockResolvedValue({ id: 'attempt-1' });
    prismaMock.reviewItem.findUnique.mockResolvedValue(null);
    prismaMock.reviewItem.create.mockResolvedValue({ id: 'review-1' });

    const response = await quizAnswer(
      new Request('http://localhost/api/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          questionId: 'question-1',
          answer: 'Test',
          correct: true,
          quality: 4,
          totalQuestions: 5
        })
      })
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.quizAttemptId).toBe('quiz-1');
    expect(recordSessionMock).toHaveBeenCalledTimes(1);
  });

  it('review answer returns 404 when review item is missing', async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue(null);

    const response = await reviewAnswer(
      new Request('http://localhost/api/review/answer', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: 'review-1',
          questionId: 'question-1',
          answer: 'Test',
          correct: true,
          quality: 4
        })
      })
    );

    expect(response.status).toBe(404);
  });

  it('review answer returns 200 on success', async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: 'review-1',
      easinessFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapseCount: 0
    });
    prismaMock.reviewItem.update.mockResolvedValue({ id: 'review-1' });

    const response = await reviewAnswer(
      new Request('http://localhost/api/review/answer', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: 'review-1',
          questionId: 'question-1',
          answer: 'Test',
          correct: true,
          quality: 5
        })
      })
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(recordSessionMock).toHaveBeenCalledTimes(1);
  });

  it('ritual log returns 400 for missing ritualId', async () => {
    const response = await ritualLog(
      new Request('http://localhost/api/rituals/log', {
        method: 'POST',
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
  });

  it('ritual log returns 200 on success', async () => {
    prismaMock.ritualLog.upsert.mockResolvedValue({ id: 'log-1' });

    const response = await ritualLog(
      new Request('http://localhost/api/rituals/log', {
        method: 'POST',
        body: JSON.stringify({ ritualId: 'ritual-1' })
      })
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(recordSessionMock).toHaveBeenCalledTimes(1);
  });
});
