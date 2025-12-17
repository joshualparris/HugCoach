import { prisma } from '@/lib/prisma';
import ReviewRunner from '@/components/ReviewRunner';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const now = new Date();

  const reviewItems = await prisma.reviewItem.findMany({
    where: { dueAt: { lte: now } },
    include: {
      question: {
        include: { lesson: true }
      }
    },
    orderBy: { dueAt: 'asc' }
  });

  const items = reviewItems.map((item) => ({
    reviewItemId: item.id,
    questionId: item.questionId,
    lessonTitle: item.question.lesson.title,
    type: item.question.type as 'mcq' | 'short_answer',
    question: item.question.question,
    options: item.question.options ? (JSON.parse(item.question.options) as string[]) : undefined,
    correctAnswer:
      item.question.type === 'short_answer'
        ? (JSON.parse(item.question.correctAnswer) as string[])
        : item.question.correctAnswer,
    explanation: item.question.explanation
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Review queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length} review{items.length === 1 ? '' : 's'} due.
        </p>
      </div>

      <ReviewRunner items={items} />
    </div>
  );
}
