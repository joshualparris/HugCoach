import { NextResponse } from 'next/server';
import { awardQuizCompletion } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizAttemptId, correctCount, totalQuestions, durationSeconds } = body ?? {};

    if (!quizAttemptId || !Number.isFinite(Number(totalQuestions))) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const summary = await awardQuizCompletion({
      quizAttemptId: String(quizAttemptId),
      correctCount: Number(correctCount ?? 0),
      totalQuestions: Number(totalQuestions ?? 0),
      durationSeconds: Number.isFinite(Number(durationSeconds)) ? Number(durationSeconds) : null
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to complete quiz.' }, { status: 500 });
  }
}
