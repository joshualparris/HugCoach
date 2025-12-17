# Spaced Repetition Specification


## Algorithm: SM-2 (Simplified)


### Background
SuperMemo 2 algorithm (Wozniak, 1990) is battle-tested and simple to implement. It uses:
- **Easiness Factor (EF)**: Reflects how easy a question is for the user (1.3 to 2.5)
- **Interval**: Days until next review
- **Repetitions**: Count of successful reviews


### Core Formula


```typescript
function calculateNextReview(
  quality: number, // 0-5 rating
  currentEF: number,
  currentInterval: number,
  repetitions: number
): { newEF: number; newInterval: number; newReps: number; dueAt: Date } {
  
  // Update Easiness Factor
  let newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF); // Floor at 1.3
  
  let newInterval: number;
  let newReps: number;
  
  if (quality < 3) {
    // Lapse: reset interval
    newInterval = 1;
    newReps = 0;
  } else {
    // Success: increase interval
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEF);
    }
    newReps = repetitions + 1;
  }
  
  // Cap interval at 180 days (optional)
  newInterval = Math.min(newInterval, 180);
  
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + newInterval);
  
  return { newEF, newInterval, newReps, dueAt };
}
```


### Quality Ratings


| Rating | Label | Meaning | Effect |
|--------|-------|---------|--------|
| 0 | Blackout | Complete memory failure | Reset to day 1 |
| 1 | Incorrect | Wrong answer after effort | Reset to day 1 |
| 2 | Incorrect (easy) | Wrong but felt easy | Reset to day 1 |
| 3 | Correct (hard) | Right answer with effort | Increase interval, lower EF |
| 4 | Correct (good) | Right answer, some hesitation | Standard interval increase |
| 5 | Perfect | Instant correct recall | Larger interval increase |


### Database Fields (ReviewItem table)


```typescript
interface ReviewItem {
  id: string;
  questionId: string;
  userId: string;
  easinessFactor: number; // Default: 2.5
  intervalDays: number; // Default: 0 (new item)
  repetitions: number; // Default: 0
  dueAt: Date; // Initially: now (immediate first review)
  lastReviewedAt: Date | null;
  createdAt: Date;
}
```


### Scheduling Rules


#### Initial Schedule (after first quiz)
- All questions from quiz -> ReviewItem with `dueAt = now + 1 day`
- First review happens next day


#### Subsequent Reviews
- Quality 0-2: Reset to 1-day interval (lapse)
- Quality 3: Interval  EF, but EF decreases slightly
- Quality 4-5: Interval  EF, EF stable or increases


#### Review Queue Priority
1. **Overdue** (dueAt < today): Sorted oldest first
2. **Due today** (dueAt = today): Sorted by creation time
3. **Upcoming** (dueAt > today): Not shown (wait until due)


### Lapse Handling


**Definition**: Quality < 3 is a lapse (forgot the answer).


**Actions**:
- Reset interval to 1 day
- Reset repetitions to 0
- Keep EF (to track difficulty history)
- Mark as "needs review" in analytics


**Frequency Cap**: If a question lapses >3 times, flag for content review (might be confusing).


## Mastery Thresholds


### Question-Level Mastery
- **Criterion**: EF >= 2.3 AND interval >= 14 days
- **Interpretation**: User can recall consistently with 2+ week gaps


### Topic-Level Mastery
```typescript
function calculateTopicMastery(questions: ReviewItem[]): number {
  const masteredCount = questions.filter(q => 
    q.easinessFactor >= 2.3 && q.intervalDays >= 14
  ).length;
  return (masteredCount / questions.length) * 100;
}
```


- 0-40%: Novice
- 41-70%: Intermediate
- 71-89%: Proficient
- 90-100%: Mastery


## Edge Cases


### Never Reviewed
- **Scenario**: Question created but never reviewed
- **Handling**: Show in review queue immediately (dueAt = now)


### Skipped Reviews
- **Scenario**: User doesn't review for days, items pile up
- **Handling**: Review queue shows all overdue (cap UI at 50 to avoid overwhelm)


### Deleted Questions
- **Scenario**: Content updated, old questions removed
- **Handling**: Soft-delete ReviewItems, exclude from mastery calculations


### Timezone Changes
- **Scenario**: User travels across timezones
- **Handling**: Use UTC for all `dueAt` timestamps, display in local time
