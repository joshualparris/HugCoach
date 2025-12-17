import { prisma } from './prisma';
import { todayString } from './date';

export async function recordSession(date = new Date()): Promise<void> {
  const dateKey = todayString(date);
  await prisma.session.upsert({
    where: { date: dateKey },
    update: { active: true },
    create: { date: dateKey }
  });
}
