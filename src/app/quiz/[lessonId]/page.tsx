import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QuizRunner from '@/components/QuizRunner';
import { getOrCreateUser } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

type QuizPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { lessonId } = await params;
  const user = await getOrCreateUser();
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      topic: true,
      questions: { orderBy: { order: 'asc' } }
    }
  });

  if (!lesson) {
    notFound();
  }

  if (lesson.minLevel > user.level || lesson.topic.minLevel > user.level) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Quiz locked</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reach Level {Math.max(lesson.minLevel, lesson.topic.minLevel)} to unlock this quiz.
        </p>
      </div>
    );
  }

  const questions = lesson.questions.map((question) => ({
    id: question.id,
    type: question.type as 'mcq' | 'short_answer',
    question: question.question,
    options: question.options ? (JSON.parse(question.options) as string[]) : undefined,
    correctAnswer:
      question.type === 'short_answer'
        ? (JSON.parse(question.correctAnswer) as string[])
        : question.correctAnswer,
    explanation: question.explanation
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quiz</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Answer each question and rate your recall to schedule reviews.
        </p>
      </div>
      <QuizRunner lessonId={lesson.id} lessonTitle={lesson.title} questions={questions} />
    </div>
  );
}
