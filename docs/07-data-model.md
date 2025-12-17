# Data Model Specification


## Prisma Schema


```prisma
// prisma/schema.prisma


generator client {
  provider = "prisma-client-js"
}


datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}


// ============================================================================
// CONTENT STRUCTURE
// ============================================================================


model Topic {
  id          String   @id @default(cuid())
  title       String
  description String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  lessons     Lesson[]
  
  @@index([order])
}


model Lesson {
  id             String   @id @default(cuid())
  topicId        String
  title          String
  slug           String   @unique
  content        String   // Markdown content
  estimatedMinutes Int    @default(10)
  order          Int      @default(0)
  learningObjectives String // JSON array of objectives
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  topic          Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  questions      Question[]
  quizAttempts   QuizAttempt[]
  
  @@index([topicId])
  @@index([order])
}


model Question {
  id          String   @id @default(cuid())
  lessonId    String
  type        String   // 'mcq' | 'short_answer'
  question    String
  options     String?  // JSON array (for MCQ)
  correctAnswer String // Index (for MCQ) or sample answers (for short_answer)
  explanation String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  attempts    QuestionAttempt[]
  reviewItems ReviewItem[]
  
  @@index([lessonId])
  @@index([order])
}


// ============================================================================
// LEARNING ATTEMPTS & REVIEWS
// ============================================================================


model QuizAttempt {
  id          String   @id @default(cuid())
  lessonId    String
  score       Int      // Correct answers count
  total       Int      // Total questions
  timeSpent   Int?     // Seconds
  createdAt   DateTime @default(now())
  
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questionAttempts QuestionAttempt[]
  
  @@index([lessonId])
  @@index([createdAt])
}


model QuestionAttempt {
  id            String   @id @default(cuid())
  quizAttemptId String
  questionId    String
  answer        String   // User's answer
  correct       Boolean
  quality       Int      // 0-5 rating
  createdAt     DateTime @default(now())
  
  quizAttempt   QuizAttempt @relation(fields: [quizAttemptId], references: [id], onDelete: Cascade)
  question      Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@index([quizAttemptId])
  @@index([questionId])
}


model ReviewItem {
  id              String    @id @default(cuid())
  questionId      String    @unique
  easinessFactor  Float     @default(2.5)
  intervalDays    Int       @default(0)
  repetitions     Int       @default(0)
  dueAt           DateTime  @default(now())
  lastReviewedAt  DateTime?
  lapseCount      Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  question        Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@index([dueAt])
  @@index([questionId])
}


// ============================================================================
// RITUALS & REFLECTIONS
// ============================================================================


model Ritual {
  id          String   @id @default(cuid())
  title       String
  description String
  type        String   // 'daily' | 'weekly'
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  
  logs        RitualLog[]
  
  @@index([type])
  @@index([order])
}


model RitualLog {
  id        String   @id @default(cuid())
  ritualId  String
  date      String   // YYYY-MM-DD format
  notes     String?
  createdAt DateTime @default(now())
  
  ritual    Ritual   @relation(fields: [ritualId], references: [id], onDelete: Cascade)
  
  @@unique([ritualId, date])
  @@index([date])
}


model Reflection {
  id        String   @id @default(cuid())
  type      String   // 'quiz' | 'weekly' | 'ritual'
  content   String
  metadata  String?  // JSON (e.g., { quizAttemptId, weekStart })
  createdAt DateTime @default(now())
  
  @@index([type])
  @@index([createdAt])
}


// ============================================================================
// USER PROGRESS & ANALYTICS
// ============================================================================


model Session {
  id        String   @id @default(cuid())
  date      String   @unique // YYYY-MM-DD format
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  
  @@index([date])
}
```


## Table Descriptions


### Topic
**Purpose**: Top-level content organization (e.g., "Communication Foundations")


**Fields**:
- `id`: Unique identifier
- `title`: Display name
- `description`: Brief overview (2-3 sentences)
- `order`: Sort order for display
- `lessons`: One-to-many relationship with Lesson


**Example**:
```json
{
  "id": "topic_1",
  "title": "Communication Foundations",
  "description": "Master the basics of emotional connection through Gottman's research and consent-first communication.",
  "order": 1
}
```


### Lesson
**Purpose**: Individual learning modules with content + quiz


**Fields**:
- `slug`: URL-friendly identifier (e.g., "active-listening")
- `content`: Full Markdown text (rendered on lesson page)
- `estimatedMinutes`: Reading + quiz time estimate
- `learningObjectives`: JSON array of goals (e.g., `["Identify Gottman's 'bids'", "Practice turning towards"]`)


**Example**:
```json
{
  "id": "lesson_1",
  "topicId": "topic_1",
  "title": "Active Listening & Bids for Connection",
  "slug": "active-listening",
  "content": "# Active Listening...",
  "estimatedMinutes": 12,
  "learningObjectives": "[\"Identify bids\", \"Practice responses\"]",
  "order": 1
}
```


### Question
**Purpose**: Quiz/review questions linked to lessons


**Fields**:
- `type`: "mcq" or "short_answer"
- `options`: JSON array for MCQ (e.g., `["Option A", "Option B"]`)
- `correctAnswer`: For MCQ, index (e.g., `"0"`); for short_answer, sample answers JSON
- `explanation`: Feedback shown after answering


**MCQ Example**:
```json
{
  "id": "q_1",
  "lessonId": "lesson_1",
  "type": "mcq",
  "question": "What is a 'bid' in Gottman's terminology?",
  "options": "[\"Request for connection\", \"Argument tactic\", \"Compliment\", \"Apology\"]",
  "correctAnswer": "0",
  "explanation": "A bid is any attempt to connect..."
}
```


**Short Answer Example**:
```json
{
  "id": "q_2",
  "type": "short_answer",
  "question": "Describe one brake from Nagoski's model you experience.",
  "correctAnswer": "[\"Stress\", \"Fatigue\", \"Distractions\"]",
  "explanation": "Common brakes include..."
}
```


### QuizAttempt
**Purpose**: Track each quiz completion


**Fields**:
- `score`: Number of correct answers
- `total`: Total questions in quiz
- `timeSpent`: Optional (seconds to complete)
- `questionAttempts`: One-to-many with QuestionAttempt


### QuestionAttempt
**Purpose**: Individual question responses within a quiz


**Fields**:
- `answer`: User's raw answer (text or option index)
- `correct`: Boolean (calculated server-side)
- `quality`: User's self-rating (0-5)


### ReviewItem
**Purpose**: Spaced repetition state for each question


**Fields**:
- `easinessFactor`: SM-2 difficulty metric (1.3-2.5)
- `intervalDays`: Days until next review
- `repetitions`: Successful review count
- `dueAt`: DateTime when review is due
- `lapseCount`: Times user forgot (for analytics)


**State Progression**:
```
New Question -> First Review (1 day) -> Second Review (6 days) 
  -> Third Review (14 days) -> Fourth Review (~35 days) -> ...
```


### Ritual
**Purpose**: Seed data for daily/weekly connection activities


**Fields**:
- `type`: "daily" or "weekly"
- `title`: "20-second hug", "2-minute check-in", etc.
- `description`: Instructions and purpose


**Example**:
```json
{
  "id": "ritual_1",
  "title": "20-Second Hug",
  "description": "A sustained hug lasting at least 20 seconds releases oxytocin...",
  "type": "daily",
  "order": 1
}
```


### RitualLog
**Purpose**: Track ritual completion


**Fields**:
- `date`: YYYY-MM-DD string (unique per ritual per day)
- `notes`: Optional reflection


**Constraint**: `@@unique([ritualId, date])` prevents duplicate logs


### Reflection
**Purpose**: Store user's metacognitive reflections


**Fields**:
- `type`: Context (quiz, weekly, ritual)
- `content`: User's text
- `metadata`: JSON with related IDs


### Session
**Purpose**: Track daily activity for streak calculation


**Fields**:
- `date`: YYYY-MM-DD (unique)
- `active`: Boolean (did user do anything today?)


**Streak Logic**:
```typescript
function calculateStreak(): number {
  const sessions = await db.session.findMany({
    where: { active: true },
    orderBy: { date: 'desc' }
  });
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const session of sessions) {
    if (isSameOrPreviousDay(session.date, currentDate)) {
      streak++;
      currentDate = new Date(session.date);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
```


## Relationships Diagram


```
Topic
  -> Lesson (many)
        -> Question (many)
             -> QuestionAttempt (many)
             -> ReviewItem (one)
        -> QuizAttempt (many)
              -> QuestionAttempt (many)


Ritual
  -> RitualLog (many)


(Reflection and Session are standalone)
```


## Seed Data Structure


### Seed Script Overview
**File**: `prisma/seed.ts`


**What it populates**:
1. **3 Topics** (Communication, Arousal, Mindfulness)
2. **2 Lessons per topic** (6 total)
3. **5 Questions per lesson** (30 total)
4. **4 Daily rituals** (hug, check-in, gratitude, prayer)
5. **3 Weekly rituals** (date night, sensate focus, reflection)


### Sample Topic Seed
```typescript
const topics = [
  {
    title: "Communication Foundations",
    description: "Master emotional connection through research-backed communication strategies and consent frameworks.",
    order: 1,
    lessons: [
      {
        title: "Active Listening & Bids for Connection",
        slug: "active-listening",
        content: readFileSync('./content/topics/communication-foundations/01-active-listening.md', 'utf-8'),
        estimatedMinutes: 12,
        learningObjectives: JSON.stringify([
          "Identify Gottman's 'bids' for connection",
          "Practice turning towards responses",
          "Recognize turning away and turning against patterns"
        ]),
        order: 1,
        questions: [
          {
            type: "mcq",
            question: "What is a 'bid' in Gottman's terminology?",
            options: JSON.stringify([
              "An attempt to connect emotionally",
              "A way to win an argument",
              "A form of manipulation",
              "A romantic gesture"
            ]),
            correctAnswer: "0",
            explanation: "A bid is any attempt-verbal or nonverbal-to connect with your partner...",
            order: 1
          },
          // ... 4 more questions
        ]
      },
      // ... 1 more lesson
    ]
  },
  // ... 2 more topics
];
```


### Content File Structure
**Location**: `content/topics/[topic-slug]/[lesson-number]-[lesson-slug].md`


**Example**: `content/topics/communication-foundations/01-active-listening.md`


```markdown
# Active Listening & Bids for Connection


## Learning Objectives
By the end of this lesson, you will be able to:
- Identify emotional bids in everyday interactions
- Practice "turning towards" responses
- Recognize patterns of turning away or against


## What Are Bids?


Dr. John Gottman's research on couples revealed a simple but profound insight: **the small moments matter most**. A "bid" is any attempt to connect-verbal or nonverbal...


## The Three Responses


When your partner makes a bid, you have three options...


[Full lesson content continues...]
```


## Migration Strategy


### Initial Setup
```bash
npx prisma migrate dev --name init
npx prisma db seed
```


### Adding Fields (Example: Add `difficulty` to Question)
```bash
# 1. Update schema.prisma
model Question {
  // ... existing fields
  difficulty String @default("medium") // 'easy' | 'medium' | 'hard'
}


# 2. Create migration
npx prisma migrate dev --name add_question_difficulty


# 3. Backfill existing data
npx prisma db execute --stdin < backfill-difficulty.sql
```


### Data Export/Import
```typescript
// Export all data
async function exportData() {
  const data = {
    topics: await db.topic.findMany({ include: { lessons: { include: { questions: true } } } }),
    rituals: await db.ritual.findMany(),
    quizAttempts: await db.quizAttempt.findMany({ include: { questionAttempts: true } }),
    reviewItems: await db.reviewItem.findMany(),
    // ...
  };
  
  writeFileSync('./backup.json', JSON.stringify(data, null, 2));
}


// Import from backup
async function importData(backup: any) {
  await db.$transaction(async (tx) => {
    // Delete existing data
    await tx.questionAttempt.deleteMany();
    await tx.quizAttempt.deleteMany();
    // ... (in reverse FK order)
    
    // Re-create from backup
    for (const topic of backup.topics) {
      await tx.topic.create({ data: topic });
    }
    // ...
  });
}
```
