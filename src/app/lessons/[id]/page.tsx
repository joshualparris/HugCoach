import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const user = await getOrCreateUser();
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { topic: true }
  });

  if (!lesson) {
    notFound();
  }

  if (lesson.minLevel > user.level || lesson.topic.minLevel > user.level) {
    return (
      <div className="space-y-4">
        <Link href={`/topics/${lesson.topicId}`} className="text-sm text-blue-600 hover:text-blue-700">
          Back to {lesson.topic.title}
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach Level {Math.max(lesson.minLevel, lesson.topic.minLevel)} to unlock this lesson.
          </p>
        </div>
      </div>
    );
  }

  const objectives: string[] = JSON.parse(lesson.learningObjectives || '[]');

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/topics/${lesson.topicId}`} className="text-sm text-blue-600 hover:text-blue-700">
          Back to {lesson.topic.title}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">{lesson.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Estimated time: {lesson.estimatedMinutes} minutes
        </p>
      </div>

      {objectives.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Learning objectives</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground/80">
            {objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm text-sm leading-6 text-foreground/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
      </section>

      <div className="flex justify-end">
        <Link
          href={`/quiz/${lesson.id}`}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start quiz
        </Link>
      </div>
    </div>
  );
}
