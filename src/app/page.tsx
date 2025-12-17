import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { todayString } from '@/lib/date';
import { calculateStreak } from '@/lib/streak';
import { getOrCreateUser, levelTitle, xpForLevel, xpForNextLevel } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const now = new Date();
  const today = todayString(now);
  const user = await getOrCreateUser();

  const [dueCount, ritualLogs, rituals, lessons, streak] = await Promise.all([
    prisma.reviewItem.count({ where: { dueAt: { lte: now } } }),
    prisma.ritualLog.findMany({ where: { date: today } }),
    prisma.ritual.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] }),
    prisma.lesson.findMany({
      include: { topic: true, quizAttempts: { select: { id: true } } },
      where: {
        minLevel: { lte: user.level },
        topic: { minLevel: { lte: user.level } }
      },
      orderBy: [{ topic: { order: 'asc' } }, { order: 'asc' }]
    }),
    calculateStreak()
  ]);

  const nextLesson = lessons.find((lesson) => lesson.quizAttempts.length === 0) ?? lessons[0];
  const ritualCompleted = ritualLogs.length;
  const currentLevelFloor = xpForLevel(user.level);
  const nextLevelTarget = xpForNextLevel(user.level);
  const progress = Math.max(
    0,
    Math.min(1, (user.currentXP - currentLevelFloor) / (nextLevelTarget - currentLevelFloor))
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Today&apos;s Plan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Focus on small, consistent actions. Keep it simple and repeatable.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Level {user.level}</p>
            <p className="text-lg font-semibold">{levelTitle(user.level)}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{user.currentXP} XP</p>
            <p>{user.currency} Sparks</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {nextLevelTarget - user.currentXP} XP to level {user.level + 1}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Reviews due</p>
          <p className="mt-2 text-3xl font-semibold">{dueCount}</p>
          <Link
            href="/review"
            className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Start reviews
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Next lesson</p>
          <p className="mt-2 text-lg font-semibold">
            {nextLesson ? nextLesson.title : 'No lessons available'}
          </p>
          {nextLesson && (
            <p className="text-sm text-muted-foreground">{nextLesson.topic.title}</p>
          )}
          {nextLesson && (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Continue learning
            </Link>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Rituals today</p>
          <p className="mt-2 text-3xl font-semibold">
            {ritualCompleted}/{rituals.filter((ritual) => ritual.type === 'daily').length}
          </p>
          <Link
            href="/rituals"
            className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Log rituals
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Momentum</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Current streak</p>
            <p className="text-2xl font-semibold">{streak} day{streak === 1 ? '' : 's'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quick actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/review"
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-border/70"
              >
                Review
              </Link>
              <Link
                href="/topics"
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-border/70"
              >
                Browse topics
              </Link>
              <Link
                href="/rituals"
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-border/70"
              >
                Rituals
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
