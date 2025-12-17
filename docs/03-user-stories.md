# User Stories + Acceptance Criteria


## Epic 1: Learning Loop


### US-001: Browse Topics
**As Josh**, I want to see available learning topics so I can choose what to study.


**Acceptance Criteria:**
- [ ] `/topics` page displays 3+ topics with title, description, lesson count
- [ ] Each topic shows mastery percentage (0-100%)
- [ ] Click topic navigates to topic detail page
- [ ] Topics are ordered by: incomplete -> in-progress -> mastered


### US-002: Read Lesson
**As Josh**, I want to read a lesson's content so I can learn new concepts.


**Acceptance Criteria:**
- [ ] `/lessons/[id]` renders Markdown content with proper formatting
- [ ] Page shows: topic breadcrumb, lesson title, estimated time, learning objectives
- [ ] "Start Quiz" button appears at bottom
- [ ] Progress indicator shows current lesson position in topic
- [ ] Content is responsive (mobile-friendly)


### US-003: Take Quiz
**As Josh**, I want to complete a quiz after a lesson so I can test my understanding.


**Acceptance Criteria:**
- [ ] `/quiz/[lessonId]` displays 5 questions sequentially
- [ ] Supports MCQ (radio buttons) and short answer (text input)
- [ ] After answering, immediate feedback shows:
  - Correct/incorrect indicator
  - Explanation of correct answer
  - Quality rating prompt (0-5: blackout -> perfect)
- [ ] Submit button is disabled until answer provided
- [ ] Quiz completion shows summary (score, time taken)
- [ ] Answers are saved to database (QuizAttempt + QuestionAttempt records)


### US-004: Schedule Reviews
**As the system**, I want to schedule spaced reviews based on quiz performance so users retain knowledge.


**Acceptance Criteria:**
- [ ] After each question attempt, ReviewItem record created with:
  - `dueAt` calculated via SM-2 algorithm
  - `easinessFactor` initialized/updated (2.5 start, adjusted by quality)
  - `intervalDays` calculated (1, 6, then EF-multiplied)
  - `repetitions` incremented
- [ ] Quality 0-2 resets interval to 1 day (lapse)
- [ ] Quality 3+ increases interval exponentially
- [ ] Database stores full review history


### US-005: Complete Reviews
**As Josh**, I want to review due questions so I don't forget what I learned.


**Acceptance Criteria:**
- [ ] `/review` page shows count of due reviews
- [ ] Questions presented one at a time (card format)
- [ ] After answering, rate quality (0-5) and see feedback
- [ ] Review updates ReviewItem (new dueAt, EF, interval)
- [ ] "No reviews due" message when queue empty
- [ ] Reviews are sorted by: overdue (oldest first) -> due today


## Epic 2: Connection Rituals


### US-006: Log Rituals
**As Josh**, I want to log daily connection rituals so I build consistent habits.


**Acceptance Criteria:**
- [ ] `/rituals` page shows checklist of daily rituals:
  - 20-second hug
  - 2-minute check-in
  - Gratitude sharing
  - Prayer/spiritual moment
- [ ] Each ritual has checkbox that creates RitualLog entry with timestamp
- [ ] Cannot check future dates (only today/past)
- [ ] Weekly rituals section with longer activities
- [ ] Ritual descriptions include WHY (purpose/benefit)


### US-007: View Dashboard
**As Josh**, I want to see today's learning plan so I know what to do.


**Acceptance Criteria:**
- [ ] `/` (home) shows:
  - Review count (with urgency indicator if overdue)
  - Next recommended lesson (from incomplete topics)
  - Today's ritual checklist status
  - Current streak (days of activity)
- [ ] Quick action buttons: "Start Reviews", "Continue Learning", "Log Rituals"
- [ ] Encouraging message if no actions due
- [ ] Last activity timestamp


## Epic 3: Progress Tracking


### US-008: Weekly Summary
**As Josh**, I want to see weekly progress so I stay motivated.


**Acceptance Criteria:**
- [ ] `/summary` page shows last 7 days:
  - Total reviews completed
  - New lessons finished
  - Ritual adherence rate
  - Mastery improvements by topic
- [ ] Chart: daily activity heatmap
- [ ] "Weakest areas" section (topics with <70% mastery)
- [ ] Suggestions: "Focus on X this week"


## Epic 4: Safety & Boundaries


### US-009: Content Safety
**As Josh**, I want content that respects boundaries so the app feels safe.


**Acceptance Criteria:**
-- [ ] All intimacy content emphasizes consent/communication
- [ ] Disclaimers on lessons: "Not medical advice", "Pause if causing conflict"
- [ ] Clear escalation guidance: "Consider counseling if..."
- Explicit Content is Allowed if it helps achieve goals of becoming a master of female and male orgasm and connection between a married man and woman.


### 2. Learning Science + Quiz Design
