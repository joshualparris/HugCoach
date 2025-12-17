import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSm2 } from '@/lib/sm2';
import { recordSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewItemId, questionId, answer, correct, quality } = body ?? {};

    if (!reviewItemId || !questionId || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const now = new Date();
    const reviewItem = await prisma.reviewItem.findUnique({
      where: { id: String(reviewItemId) }
    });

    if (!reviewItem) {
      return NextResponse.json({ error: 'Review item not found.' }, { status: 404 });
    }

    const qualityValue = Number.isFinite(Number(quality)) ? Number(quality) : 0;
    const result = calculateSm2({
      quality: qualityValue,
      easinessFactor: reviewItem.easinessFactor,
      intervalDays: reviewItem.intervalDays,
      repetitions: reviewItem.repetitions,
      lapseCount: reviewItem.lapseCount
    }, now);

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

    await recordSession(now);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 });
  }
}
