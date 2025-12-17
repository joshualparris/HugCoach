import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const user = await getOrCreateUser();
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      lessons: {
        include: {
          quizAttempts: { select: { id: true } }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!topic) {
    notFound();
  }

  if (topic.minLevel > user.level) {
    return (
      <div className="space-y-4">
        <Link href="/topics" className="text-sm text-blue-600 hover:text-blue-700">
          Back to topics
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{topic.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Reach Level {topic.minLevel} to unlock this topic.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/topics" className="text-sm text-blue-600 hover:text-blue-700">
          Back to topics
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{topic.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
      </div>

      <div className="space-y-3">
        {topic.lessons.map((lesson) => {
          const completed = lesson.quizAttempts.length > 0;
          const locked = lesson.minLevel > user.level;
          return (
            <div
              key={lesson.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{lesson.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {lesson.estimatedMinutes} min read
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    locked
                      ? 'bg-amber-100 text-amber-700'
                      : completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {locked ? `Locked (Level ${lesson.minLevel})` : completed ? 'Completed' : 'Not started'}
                </span>
              </div>
              <div className="mt-3 flex gap-3">
                {locked ? (
                  <span className="text-sm text-muted-foreground">Unlock to view lesson</span>
                ) : (
                  <>
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Read lesson
                    </Link>
                    <Link
                      href={`/quiz/${lesson.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Start quiz
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
