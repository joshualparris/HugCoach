import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSm2 } from '@/lib/sm2';
import { recordSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quizAttemptId,
      lessonId,
      questionId,
      answer,
      correct,
      quality,
      totalQuestions
    } = body ?? {};

    if (!lessonId || !questionId || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const now = new Date();

    const attemptId = quizAttemptId
      ? String(quizAttemptId)
      : (
          await prisma.quizAttempt.create({
            data: {
              lessonId: String(lessonId),
              score: 0,
              total: Number(totalQuestions ?? 0)
            }
          })
        ).id;

    const qualityValue = Number.isFinite(Number(quality)) ? Number(quality) : 0;

    await prisma.questionAttempt.create({
      data: {
        quizAttemptId: attemptId,
        questionId: String(questionId),
        answer: String(answer),
        correct: Boolean(correct),
        quality: Math.max(0, Math.min(5, qualityValue))
      }
    });

    if (correct) {
      await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: { score: { increment: 1 } }
      });
    }

    const reviewItem = await prisma.reviewItem.findUnique({
      where: { questionId: String(questionId) }
    });

    const result = calculateSm2({
      quality: qualityValue,
      easinessFactor: reviewItem?.easinessFactor ?? 2.5,
      intervalDays: reviewItem?.intervalDays ?? 0,
      repetitions: reviewItem?.repetitions ?? 0,
      lapseCount: reviewItem?.lapseCount ?? 0
    }, now);

    if (reviewItem) {
      await prisma.reviewItem.update({
        where: { id: reviewItem.id },
        data: {
          easinessFactor: result.easinessFactor,
          intervalDays: result.intervalDays,
          repetitions: result.repetitions,
          lapseCount: result.lapseCount,
          dueAt: result.dueAt,
          lastReviewedAt: now
        }
      });
    } else {
      await prisma.reviewItem.create({
        data: {
          questionId: String(questionId),
          easinessFactor: result.easinessFactor,
          intervalDays: result.intervalDays,
          repetitions: result.repetitions,
          lapseCount: result.lapseCount,
          dueAt: result.dueAt,
          lastReviewedAt: now
        }
      });
    }

    await recordSession(now);

    return NextResponse.json({ quizAttemptId: attemptId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save answer.' }, { status: 500 });
  }
}
