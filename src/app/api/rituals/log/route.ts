import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { todayString } from '@/lib/date';
import { recordSession } from '@/lib/session';
import { awardRitualLog } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ritualId, shared } = body ?? {};

    if (!ritualId) {
      return NextResponse.json({ error: 'Missing ritualId.' }, { status: 400 });
    }

    const date = todayString();

    await prisma.ritualLog.upsert({
      where: {
        ritualId_date: {
          ritualId: String(ritualId),
          date
        }
      },
      update: {
        shared: Boolean(shared)
      },
      create: {
        ritualId: String(ritualId),
        date,
        shared: Boolean(shared)
      }
    });

    const reward = await awardRitualLog({ shared: Boolean(shared) });

    await recordSession(new Date());

    return NextResponse.json({ ok: true, reward });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log ritual.' }, { status: 500 });
  }
}
