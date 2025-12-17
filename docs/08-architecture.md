# Technical Architecture (MVP)


## Stack


### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.x + shadcn/ui components
- **Database**: SQLite (via better-sqlite3)
- **ORM**: Prisma 5.x
- **Testing**: Vitest + Testing Library


### Why This Stack?


**Next.js**:
- Server components for performance
- File-based routing (intuitive structure)
- Built-in API routes
- Easy deployment (Vercel, self-hosted)


**SQLite**:
- Zero-config database (perfect for local-first)
- Single file (easy backup/restore)
- Fast for <100k records (MVP scale)
- Can migrate to PostgreSQL later if needed


**Prisma**:
- Type-safe database access
- Migration management
- Excellent TypeScript integration


**Tailwind + shadcn/ui**:
- Rapid UI development
- Accessible components out-of-box
- Consistent design system


## Project Structure


```
joshcoach/
 app/                    # Next.js App Router
    (dashboard)/       # Groupe


```
    (dashboard)/       # Grouped routes (shared layout)
       layout.tsx     # Dashboard layout with nav
       page.tsx       # Home/Dashboard
       topics/
          page.tsx   # Topics list
          [id]/
              page.tsx  # Topic detail
       lessons/
          [id]/
              page.tsx  # Lesson reader
       quiz/
          [lessonId]/
              page.tsx  # Quiz runner
       review/
          page.tsx   # Review queue
       rituals/
          page.tsx   # Ritual tracker
       summary/
           page.tsx   # Weekly analytics
    api/               # API routes
       quiz/
          submit/route.ts
       review/
          submit/route.ts
       rituals/
           log/route.ts
    globals.css        # Global styles
    layout.tsx         # Root layout
 components/
    ui/                # shadcn/ui components
       button.tsx
       card.tsx
       progress.tsx
       ...
    dashboard/
       DashboardCard.tsx
       StreakIndicator.tsx
       TodaysPlan.tsx
    quiz/
       QuestionCard.tsx
       MCQOptions.tsx
       ShortAnswerInput.tsx
       QualityRating.tsx
    review/
       ReviewCard.tsx
    shared/
        Navbar.tsx
        Breadcrumb.tsx
        ProgressBar.tsx
 lib/
    db.ts              # Prisma client singleton
    scheduler.ts       # SM-2 algorithm
    analytics.ts       # Mastery calculations
    utils.ts           # Shared utilities
 prisma/
    schema.prisma      # Database schema
    seed.ts            # Seed data script
    migrations/        # Migration history
 content/               # Lesson content (Markdown)
    topics/
       communication-foundations/
          01-active-listening.md
          02-consent-conversations.md
       understanding-arousal/
          01-dual-control-model.md
          02-responsive-desire.md
       mindfulness-presence/
           01-sensate-focus.md
           02-mindfulness-intimacy.md
    questions/         # Question bank (JSON)
        communication-foundations.json
        understanding-arousal.json
        mindfulness-presence.json
 tests/
    unit/
       scheduler.test.ts
       analytics.test.ts
    e2e/
        quiz-flow.test.ts
        review-flow.test.ts
 docs/                  # Documentation (from above)
    01-vision.md
    02-mvp.md
    ...
    09-safety-boundaries.md
 public/
    images/            # Static assets
 .env.example
 .gitignore
 next.config.js
 package.json
 tsconfig.json
 tailwind.config.ts
 vitest.config.ts
```


## Data Flow


### Quiz Submission Flow
```
User answers question
  
POST /api/quiz/submit
  
Create QuizAttempt + QuestionAttempt records
  
For each question:
  - Calculate next review (SM-2)
  - Create/update ReviewItem
  
Return quiz results + scheduled reviews
  
Redirect to quiz summary page
```


### Review Submission Flow
```
User completes review question
  
Rate quality (0-5)
  
POST /api/review/submit
  
Update ReviewItem:
  - Calculate new EF, interval, dueAt
  - Increment repetitions (or reset if lapse)
  
Return next due review (if any)
  
Show next review or "All done!" message
```


### Dashboard Data Loading
```
Server Component loads:
  - Review count (WHERE dueAt <= NOW)
  - Next lesson (first incomplete)
  - Today's rituals (grouped by daily/weekly)
  - Current streak (consecutive active days)
  
Render with prefetched data (no loading spinners)
```


## Database Schema


### Core Tables
See `07-data-model.md` for full Prisma schema. Key relationships:


```
Topic (1) -> (N) Lesson
Lesson (1) -> (N) Question
Question (1) -> (N) QuestionAttempt
Question (1) -> (1) ReviewItem
User (1) -> (N) QuizAttempt
User (1) -> (N) RitualLog
```


### Indexes
```prisma
@@index([dueAt])                    // ReviewItem: Fast queue queries
@@index([lessonId])                 // Question: Group by lesson
@@index([userId, createdAt])        // QuizAttempt: User history
@@index([userId, ritualId, date])   // RitualLog: Daily tracking
```


## API Routes


### POST /api/quiz/submit
**Request**:
```json
{
  "lessonId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "answer": "string | number",
      "quality": 0-5
    }
  ]
}
```


**Response**:
```json
{
  "quizAttemptId": "uuid",
  "score": 80,
  "totalQuestions": 5,
  "scheduledReviews": 5,
  "results": [
    {
      "questionId": "uuid",
      "correct": true,
      "explanation": "...",
      "nextReviewAt": "2025-12-18T10:00:00Z"
    }
  ]
}
```


### POST /api/review/submit
**Request**:
```json
{
  "reviewItemId": "uuid",
  "answer": "string | number",
  "quality": 0-5
}
```


**Response**:
```json
{
  "correct": true,
  "explanation": "...",
  "nextReviewAt": "2025-12-24T10:00:00Z",
  "newInterval": 7,
  "remainingReviews": 3
}
```


### POST /api/rituals/log
**Request**:
```json
{
  "ritualId": "uuid",
  "date": "2025-12-17",
  "notes": "Felt really connected during our hug"
}
```


**Response**:
```json
{
  "ritualLogId": "uuid",
  "streakUpdated": true,
  "newStreak": 8
}
```


## Performance Targets


### Page Load
- **Dashboard**: <1s (server-rendered)
- **Lesson**: <1.5s (Markdown parse + render)
- **Quiz**: <800ms
- **Review**: <500ms (single question)


### Database Queries
- **Dashboard data**: <50ms (4-5 queries, indexed)
- **Quiz submission**: <100ms (transaction with 5-10 inserts)
- **Review queue**: <30ms (indexed dueAt query)


### Bundle Size
- **First Load JS**: <150KB (Next.js + React)
- **Page JS**: <50KB per route
- **Total**: <500KB (including Tailwind)


## Security Considerations


### Local-First Security
- No authentication needed (single-user, local device)
- File permissions: Database file readable only by user
- No network requests (except optional future sync)


### Input Validation
- **API routes**: Validate all inputs with Zod schemas
- **Quality ratings**: Constrain to 0-5
- **Dates**: Validate ISO 8601 format
- **SQL injection**: Prevented by Prisma (parameterized queries)


### Data Integrity
- **Transactions**: Use Prisma transactions for multi-step operations
- **Constraints**: Foreign keys, unique constraints in schema
- **Soft deletes**: Flag records as deleted, don't remove


## Deployment Options


### Development (WSL)
```bash
npm run dev        # Next.js dev server on localhost:3000
npm run db:push    # Sync Prisma schema to SQLite
npm run db:seed    # Populate with seed data
```


### Production (Self-Hosted)
```bash
npm run build      # Create optimized production build
npm run start      # Run production server
```


**Database location**: `prisma/dev.db` (can configure path)


### Alternative: Electron Desktop App
For true "offline-first" experience, wrap Next.js in Electron:
- Package as `.exe` (Windows), `.app` (Mac), `.deb` (Linux)
- Bundle SQLite database
- No browser required


## Testing Strategy


### Unit Tests (Vitest)
- **lib/scheduler.ts**: Test SM-2 algorithm with edge cases
- **lib/analytics.ts**: Test mastery calculations
- **lib/utils.ts**: Test helper functions


### Integration Tests
- **API routes**: Test request/response with mock database
- **Database operations**: Test Prisma queries


### E2E Tests (Playwright)
- **Quiz flow**: Complete quiz -> verify reviews scheduled
- **Review flow**: Complete review -> verify interval updated
- **Dashboard**: Verify correct counts and next lesson


### Test Coverage Target
- **Scheduler logic**: 100% (critical for learning loop)
- **API routes**: 90%
- **Overall**: 80%


## Migration Path (Future)


### v0.1 -> v0.2 (Multi-User)
- Add `User` table with authentication
- Add `userId` foreign keys to all tables
- Implement login/signup


### v0.2 -> v0.3 (Cloud Sync)
- Add sync API (Supabase, PocketBase, or custom)
- Implement conflict resolution (last-write-wins or CRDT)
- Encrypted backups to cloud


### v0.3 -> v1.0 (Mobile Apps)
- Expo/React Native for iOS/Android
- Shared TypeScript logic
- Native SQLite integration
