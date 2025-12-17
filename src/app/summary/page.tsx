import { prisma } from '@/lib/prisma';
import { todayString } from '@/lib/date';
import { masteryFromEasiness } from '@/lib/mastery';

export const dynamic = 'force-dynamic';

function lastNDates(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    dates.push(todayString(date));
  }
  return dates;
}

export default async function SummaryPage() {
  const dates = lastNDates(7);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);

  const [reviewCount, lessonCount, ritualLogs, sessions, topics, dailyRitualCount] = await Promise.all([
    prisma.reviewItem.count({ where: { lastReviewedAt: { gte: weekStart } } }),
    prisma.quizAttempt.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.ritualLog.findMany({ where: { date: { in: dates } } }),
    prisma.session.findMany({ where: { date: { in: dates } } }),
    prisma.topic.findMany({
      include: {
        lessons: {
          include: {
            questions: { include: { reviewItems: true } }
          }
        }
      },
      orderBy: { order: 'asc' }
    }),
    prisma.ritual.count({ where: { type: 'daily' } })
  ]);

  const ritualCount = ritualLogs.length;
  const totalPossibleRituals = dailyRitualCount * 7;
  const ritualRate = totalPossibleRituals > 0 ? Math.round((ritualCount / totalPossibleRituals) * 100) : 0;

  const activityByDate = dates.map((date) => ({
    date,
    active: sessions.some((session) => session.date === date)
  }));

  const topicMastery = topics.map((topic) => {
    const questions = topic.lessons.flatMap((lesson) => lesson.questions);
    const masteryValues = questions.map((question) => {
      const reviewItem = question.reviewItems[0];
      return reviewItem ? masteryFromEasiness(reviewItem.easinessFactor) : 0;
    });
    const mastery = masteryValues.length
      ? Math.round(masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length)
      : 0;

    return {
      id: topic.id,
      title: topic.title,
      mastery
    };
  });

  const weakestTopics = topicMastery.filter((topic) => topic.mastery < 70);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Weekly summary</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last 7 days at a glance.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Reviews completed</p>
          <p className="mt-2 text-3xl font-semibold">{reviewCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Lessons completed</p>
          <p className="mt-2 text-3xl font-semibold">{lessonCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Ritual adherence</p>
          <p className="mt-2 text-3xl font-semibold">{ritualRate}%</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Daily activity</h2>
        <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
          {activityByDate.map((day) => (
            <div
              key={day.date}
              className={`rounded-lg border px-2 py-3 text-center ${
                day.active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted-foreground/70'
              }`}
            >
              {day.date.slice(5)}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Weakest areas</h2>
        {weakestTopics.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No weak areas detected. Keep it up.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-foreground/80">
            {weakestTopics.map((topic) => (
              <li key={topic.id} className="flex items-center justify-between">
                <span>{topic.title}</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {topic.mastery}% mastery
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
