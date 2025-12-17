'use client';

import { useMemo, useState } from 'react';

type ReviewQuestion = {
  reviewItemId: string;
  questionId: string;
  lessonTitle: string;
  type: 'mcq' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
};

type ReviewRunnerProps = {
  items: ReviewQuestion[];
};

const qualityOptions = [0, 1, 2, 3, 4, 5];

export default function ReviewRunner({ items }: ReviewRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [quality, setQuality] = useState<number | null>(null);
  const [selfCorrect, setSelfCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const item = items[currentIndex];
  const total = items.length;

  const correctIndex = useMemo(() => {
    if (item?.type !== 'mcq') return null;
    const parsed = Number(item.correctAnswer);
    return Number.isNaN(parsed) ? null : parsed;
  }, [item]);

  const sampleAnswers = useMemo(() => {
    if (item?.type !== 'short_answer') return [] as string[];
    return Array.isArray(item.correctAnswer) ? item.correctAnswer : [];
  }, [item]);

  if (!item) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No reviews due right now.</p>
      </div>
    );
  }

  const answerValue = item.type === 'mcq' ? selectedOption : shortAnswer;
  const canSubmit = answerValue.trim().length > 0;
  const canSave = quality !== null && (item.type !== 'short_answer' || selfCorrect !== null);
  const isCorrect = item.type === 'mcq'
    ? selectedOption !== '' && Number(selectedOption) === correctIndex
    : selfCorrect === true;
  const feedbackLabel =
    item.type === 'short_answer' && selfCorrect === null
      ? 'Review and self-check'
      : isCorrect
        ? 'Correct'
        : 'Not quite yet';

  async function handleSave() {
    if (quality === null) return;
    if (item.type === 'short_answer' && selfCorrect === null) return;

    const payload = {
      reviewItemId: item.reviewItemId,
      questionId: item.questionId,
      answer: answerValue,
      correct: Boolean(isCorrect),
      quality
    };

    const res = await fetch('/api/review/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('Failed to save review');
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
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
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">All reviews complete</h2>
        <p className="mt-2 text-sm text-muted-foreground">Nice work. You can come back tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{item.lessonTitle}</p>
          <h2 className="text-lg font-semibold">Review {currentIndex + 1}</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <p className="mt-4 text-base font-medium">{item.question}</p>

      {item.type === 'mcq' ? (
        <div className="mt-4 space-y-2">
          {item.options?.map((option, index) => (
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
                name={`review-${item.questionId}`}
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
            <p className="mt-1 text-foreground/80">{item.explanation}</p>
            {item.type === 'short_answer' && sampleAnswers.length > 0 && (
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

          {item.type === 'short_answer' && (
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
