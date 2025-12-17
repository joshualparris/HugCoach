'use client';

import { useMemo, useState } from 'react';
import LevelUpModal from '@/components/LevelUpModal';

type QuizQuestion = {
  id: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
};

type QuizRunnerProps = {
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
};

const qualityOptions = [0, 1, 2, 3, 4, 5];

export default function QuizRunner({ lessonId, lessonTitle, questions }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [quality, setQuality] = useState<number | null>(null);
  const [selfCorrect, setSelfCorrect] = useState<boolean | null>(null);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [quizStartedAt] = useState(() => Date.now());
  const [reward, setReward] = useState<{
    xpEarned: number;
    sparksEarned: number;
    criticalSuccess: boolean;
    levelUp: boolean;
    level: number;
    title: string;
  } | null>(null);
  const [levelUpOpen, setLevelUpOpen] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;

  const correctIndex = useMemo(() => {
    if (question?.type !== 'mcq') return null;
    const parsed = Number(question.correctAnswer);
    return Number.isNaN(parsed) ? null : parsed;
  }, [question]);

  const sampleAnswers = useMemo(() => {
    if (question?.type !== 'short_answer') return [] as string[];
    return Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
  }, [question]);

  if (!question) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const answerValue = question.type === 'mcq' ? selectedOption : shortAnswer;
  const canSubmit = answerValue.trim().length > 0;
  const canSave = quality !== null && (question.type !== 'short_answer' || selfCorrect !== null);

  const isCorrect = question.type === 'mcq'
    ? selectedOption !== '' && Number(selectedOption) === correctIndex
    : selfCorrect === true;
  const feedbackLabel =
    question.type === 'short_answer' && selfCorrect === null
      ? 'Review and self-check'
      : isCorrect
        ? 'Correct'
        : 'Not quite yet';

  async function handleSave() {
    if (quality === null) return;
    if (question.type === 'short_answer' && selfCorrect === null) return;

    const payload = {
      quizAttemptId,
      lessonId,
      questionId: question.id,
      answer: answerValue,
      correct: Boolean(isCorrect),
      quality,
      totalQuestions: total
    };

    const res = await fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Failed to save answer');
      return;
    }

    const data = (await res.json()) as { quizAttemptId: string };
    const attemptId = quizAttemptId ?? data.quizAttemptId;
    if (!quizAttemptId) {
      setQuizAttemptId(attemptId);
    }

    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(nextScore);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      const durationSeconds = Math.round((Date.now() - quizStartedAt) / 1000);
      const completion = await fetch('/api/quiz/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAttemptId: attemptId,
          correctCount: nextScore,
          totalQuestions: total,
          durationSeconds
        })
      });

      if (completion.ok) {
        const summary = await completion.json();
        setReward(summary);
        if (summary.levelUp) {
          setLevelUpOpen(true);
        }
      }

      setDone(true);
    } else {
      setCurrentIndex(nextIndex);
    }

    setSelectedOption('');
    setShortAnswer('');
    setShowFeedback(false);
    setQuality(null);
    setSelfCorrect(null);
  }

  if (done) {
    return (
      <>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Quiz complete</h2>
          <p className="mt-2 text-sm text-muted-foreground">{lessonTitle}</p>
          <p className="mt-4 text-3xl font-semibold">
            {score} / {total}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Great job staying consistent.</p>
          {reward && (
            <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  +{reward.xpEarned} XP
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  +{reward.sparksEarned} Sparks
                </span>
                {reward.criticalSuccess && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                    Critical Success!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {reward && (
          <LevelUpModal
            open={levelUpOpen}
            level={reward.level}
            title={reward.title}
            onClose={() => setLevelUpOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{lessonTitle}</p>
          <h2 className="text-lg font-semibold">Question {currentIndex + 1}</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <p className="mt-4 text-base font-medium">{question.question}</p>

      {question.type === 'mcq' ? (
        <div className="mt-4 space-y-2">
          {question.options?.map((option, index) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                selectedOption === String(index)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-border'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={selectedOption === String(index)}
                onChange={() => setSelectedOption(String(index))}
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            value={shortAnswer}
            onChange={(event) => setShortAnswer(event.target.value)}
            className="min-h-[120px] w-full rounded-lg border border-border p-3 text-sm"
            placeholder="Write your response..."
          />
        </div>
      )}

      {!showFeedback ? (
        <button
          type="button"
          onClick={() => setShowFeedback(true)}
          disabled={!canSubmit}
          className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Check answer
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <div
            className={`rounded-lg border p-3 text-sm ${
              isCorrect ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className="font-medium">{feedbackLabel}</p>
            <p className="mt-1 text-foreground/80">{question.explanation}</p>
            {question.type === 'short_answer' && sampleAnswers.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-medium">Sample answers:</p>
                <ul className="mt-1 list-disc pl-4">
                  {sampleAnswers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {question.type === 'short_answer' && (
            <div>
              <p className="text-sm font-medium">Did you cover the key idea?</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelfCorrect(true)}
                  className={`rounded-full border px-3 py-1 text-sm ${selfCorrect === true ? 'border-green-500 bg-green-50' : 'border-border'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setSelfCorrect(false)}
                  className={`rounded-full border px-3 py-1 text-sm ${selfCorrect === false ? 'border-amber-500 bg-amber-50' : 'border-border'}`}
                >
                  Not yet
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Rate your recall (0-5)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {qualityOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuality(value)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    quality === value ? 'border-blue-500 bg-blue-50' : 'border-border'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            Save & next
          </button>
        </div>
      )}
    </div>
  );
}
