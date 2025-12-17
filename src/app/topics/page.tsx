import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { masteryFromEasiness } from '@/lib/mastery';
import { getOrCreateUser } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  const user = await getOrCreateUser();
  const topics = await prisma.topic.findMany({
    include: {
      lessons: {
        include: {
          questions: {
            include: {
              reviewItems: true
            }
          }
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  const topicCards = topics.map((topic) => {
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
      description: topic.description,
      lessonCount: topic.lessons.length,
      mastery,
      minLevel: topic.minLevel,
      locked: topic.minLevel > user.level
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Topics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a topic to continue your learning loop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topicCards.map((topic) => {
          const card = (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-border/70">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{topic.title}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {topic.mastery}% mastery
                </span>
              </div>
              <p className={`mt-2 text-sm ${topic.locked ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                {topic.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {topic.lessonCount} lesson{topic.lessonCount === 1 ? '' : 's'}
                </span>
                {topic.locked && <span>Reach Level {topic.minLevel} to unlock</span>}
              </div>
            </div>
          );

          if (topic.locked) {
            return (
              <div key={topic.id} className="relative">
                <div className="pointer-events-none opacity-70 blur-[1px]">{card}</div>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  Locked
                </div>
              </div>
            );
          }

          return (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
