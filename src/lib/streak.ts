import { prisma } from './prisma';
import { todayString } from './date';

function subtractDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

export async function calculateStreak(): Promise<number> {
  const today = new Date();
  const sessions = await prisma.session.findMany({
    select: { date: true },
    orderBy: { date: 'desc' }
  });

  const sessionSet = new Set(sessions.map((session) => session.date));
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const dateKey = todayString(subtractDays(today, i));
    if (!sessionSet.has(dateKey)) break;
    streak += 1;
  }

  return streak;
}
