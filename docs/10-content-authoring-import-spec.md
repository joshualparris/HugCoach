# Content Authoring + Import Specification


## Content Format Standards


### Lesson Content (Markdown)


**File Naming**: `[order]-[slug].md` (e.g., `01-active-listening.md`)


**Required Frontmatter**:
```yaml
---
title: Active Listening & Bids for Connection
slug: active-listening
topic: communication-foundations
estimatedMinutes: 12
learningObjectives:
  - Identify Gottman's 'bids' for connection
  - Practice turning towards responses
  - Recognize turning away/against patterns
---
```


**Content Structure**:
```markdown
# [Lesson Title]


## Learning Objectives
[Bulleted list matching frontmatter]


## Introduction
[Hook + relevance]


## Main Content
[Sections with ## headers]


### Subsection Example
[Explanations, examples, research citations]


## Key Takeaways
[3-5 bullet summary]


## Reflection Prompt
[Optional: Question for user to ponder]


## Resources
[Optional: Links to research papers, videos]
```


**Markdown Guidelines**:
- Use `##` for sections, `###` for subsections
- Bold key terms on first use: `**bid**`
- Use block quotes for important warnings:
  ```markdown
  > **Important**: Always prioritize consent and communication.
  ```
- Code blocks for examples (if applicable)
- No raw HTML (keep it portable)


### Question Bank (JSON)


**File Naming**: `[topic-slug].json`


**Structure**:
```json
{
  "topic": "communication-foundations",
  "lessons": [
    {
      "lessonSlug": "active-listening",
      "questions": [
        {
          "type": "mcq",
          "question": "What is a 'bid' in Gottman's terminology?",
          "options": [
            "An attempt to connect emotionally",
            "A way to win an argument",
            "A form of manipulation",
            "A romantic gesture"
          ],
          "correctAnswer": 0,
          "explanation": "A bid is any attempt-verbal or nonverbal-to connect with your partner. Examples include sharing a thought, asking a question, or physical touch.",
          "order": 1
        },
        {
          "type": "short_answer",
          "question": "Describe a recent 'bid' your partner made toward you. How did you respond?",
          "sampleAnswers": [
            "They asked about my day, and I put down my phone to listen",
            "They touched my shoulder, and I leaned into the touch",
            "They shared a worry, and I validated their feelings"
          ],
          "explanation": "Turning towards bids strengthens connection. Even small acknowledgments matter.",
          "order": 2
        }
        // ... 3 more questions
      ]
    }
    // ... more lessons
  ]
}
```


**Question Validation Rules**:
- MCQ must have 4 options (no more, no fewer)
- `correctAnswer` is 0-indexed integer for MCQ
- `sampleAnswers` array for short_answer (2-3 examples)
- `explanation` is required (shown after answering)
- `order` determines sequence in quiz


### Ritual Definitions (JSON)


**File**: `content/rituals.json`


```json
{
  "daily": [
    {
      "title": "20-Second Hug",
      "description": "A sustained hug lasting at least 20 seconds releases oxytocin, the 'bonding hormone.' This simple practice reduces stress and increases feelings of safety and connection.",
      "order": 1
    },
    {
      "title": "2-Minute Check-In",
      "description": "Share one high and one low from your day. Listen without trying to fix or advise-just acknowledge and empathize.",
      "order": 2
    }
  ],
  "weekly": [
    {
      "title": "At-Home Date Night",
      "description": "Set aside 60-90 minutes for a distraction-free activity together: cook a meal, play a game, or try a sensate focus exercise. The goal is presence, not perfection.",
      "order": 1
    }
  ]
}
```


## Import Script Specification


### Seed Script (`prisma/seed.ts`)


**Purpose**: Populate database with initial content for MVP.


**Steps**:
1. Parse Markdown frontmatter from lesson files
2. Load question banks (JSON)
3. Load ritual definitions
4. Create Prisma records in correct order (respect FKs)


**Implementation**:
```typescript
import { PrismaClient } from '@prisma/client';
import { readdirSync, readFileSync } from 'fs';
import matter from 'gray-matter';


const db = new PrismaClient();


async function main() {
  console.log('
Seeding database...');


  // ============================================================================
  // 1. LOAD TOPICS + LESSONS FROM MARKDOWN FILES
  // ============================================================================
  
  const topicsDir = './content/topics';
  const topicFolders = readdirSync(topicsDir);
  
  const topicsData = [];
  
  for (const [index, topicSlug] of topicFolders.entries()) {
    const lessonFiles = readdirSync(`${topicsDir}/${topicSlug}`)
      .filter(f => f.endsWith('.md'))
      .sort();
    
    const lessonsData = [];
    
    for (const lessonFile of lessonFiles) {
      const filePath = `${topicsDir}/${topicSlug}/${lessonFile}`;
      const fileContent = readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);
      
      lessonsData.push({
        title: frontmatter.title,
        slug: frontmatter.slug,
        content: content.trim(),
        estimatedMinutes: frontmatter.estimatedMinutes,
        learningObjectives: JSON.stringify(frontmatter.learningObjectives),
        order: parseInt(lessonFile.split('-')[0]),
      });
    }
    
    topicsData.push({
      title: toTitleCase(topicSlug),
      slug: topicSlug,
      description: getTopicDescription(topicSlug), // Helper function
      order: index + 1,
      lessons: lessonsData,
    });
  }
  
  // ============================================================================
  // 2. LOAD QUESTION BANKS
  // ============================================================================
  
  const questionBanks: Record<string, any> = {};
  
  for (const topic of topicsData) {
    const questionFile = `./content/questions/${topic.slug}.json`;
    const questionData = JSON.parse(readFileSync(questionFile, 'utf-8'));
    questionBanks[topic.slug] = questionData;
  }
  
  // ============================================================================
  // 3. CREATE TOPICS, LESSONS, QUESTIONS
  // ============================================================================
  
  for (const topicData of topicsData) {
    const topic = await db.topic.create({
      data: {
        title: topicData.title,
        description: topicData.description,
        order: topicData.order,
      },
    });
    
    console.log(`   Topic: ${topic.title}`);
    
    for (const lessonData of topicData.lessons) {
      const lesson = await db.lesson.create({
        data: {
          topicId: topic.id,
          title: lessonData.title,
          slug: lessonData.slug,
          content: lessonData.content,
          estimatedMinutes: lessonData.estimatedMinutes,
          learningObjectives: lessonData.learningObjectives,
          order: lessonData.order,
        },
      });
      
      console.log(`     Lesson: ${lesson.title}`);
      
      // Find questions for this lesson
      const questionBank = questionBanks[topicData.slug];
      const lessonQuestions = questionBank.lessons.find(
        (l: any) => l.lessonSlug === lessonData.slug
      )?.questions || [];
      
      for (const q of lessonQuestions) {
        const question = await db.question.create({
          data: {
            lessonId: lesson.id,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.type === 'mcq' 
              ? String(q.correctAnswer) 
              : JSON.stringify(q.sampleAnswers),
            explanation: q.explanation,
            order: q.order,
          },
        });
        
        console.log(`       Question: ${question.question.substring(0, 50)}...`);
      }
    }
  }
  
  // ============================================================================
  // 4. CREATE RITUALS
  // ============================================================================
  
  const ritualsFile = './content/rituals.json';
  const ritualsData = JSON.parse(readFileSync(ritualsFile, 'utf-8'));
  
  for (const ritual of ritualsData.daily) {
    await db.ritual.create({
      data: {
        title: ritual.title,
        description: ritual.description,
        type: 'daily',
        order: ritual.order,
      },
    });
    console.log(`   Daily Ritual: ${ritual.title}`);
  }
  
  for (const ritual of ritualsData.weekly) {
    await db.ritual.create({
      data: {
        title: ritual.title,
        description: ritual.description,
        type: 'weekly',
        order: ritual.order,
      },
    });
    console.log(`   Weekly Ritual: ${ritual.title}`);
  }
  
  console.log(' Seed complete!');
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================


function toTitleCase(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


function getTopicDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'communication-foundations': 'Master emotional connection through research-backed communication strategies and consent frameworks.',
    'understanding-arousal': 'Learn the science of desire, arousal, and pleasure through evidence-based models.',
    'mindfulness-presence': 'Develop presence and body awareness for deeper intimacy and connection.',
  };
  return descriptions[slug] || '';
}


// ============================================================================
// RUN SEED
// ============================================================================


main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
```


### Content Validation Script


**File**: `scripts/validate-content.ts`


**Purpose**: Check content before seeding to catch errors early.


```typescript
import { readdirSync, readFileSync } from 'fs';
import matter from 'gray-matter';


const errors: string[] = [];
const warnings: string[] = [];


// Validate lesson files
function validateLessons() {
  const topicsDir = './content/topics';
  const topicFolders = readdirSync(topicsDir);
  
  for (const topicSlug of topicFolders) {
    const lessonFiles = readdirSync(`${topicsDir}/${topicSlug}`)
      .filter(f => f.endsWith('.md'));
    
    for (const lessonFile of lessonFiles) {
      const filePath = `${topicsDir}/${topicSlug}/${lessonFile}`;
      const fileContent = readFileSync(filePath, 'utf-8');
      
      try {
        const { data: frontmatter, content } = matter(fileContent);
        
        // Check required frontmatter
        if (!frontmatter.title) {
          errors.push(`${filePath}: Missing 'title' in frontmatter`);
        }
        if (!frontmatter.slug) {
          errors.push(`${filePath}: Missing 'slug' in frontmatter`);
        }
        if (!frontmatter.learningObjectives || !Array.isArray(frontmatter.learningObjectives)) {
          errors.push(`${filePath}: 'learningObjectives' must be an array`);
        }
        
        // Check content length
        if (content.trim().length < 500) {
          warnings.push(`${filePath}: Content seems short (<500 chars)`);
        }
        
        // Check for common mistakes
        if (content.includes('TODO') || content.includes('FIXME')) {
          warnings.push(`${filePath}: Contains TODO/FIXME`);
        }
        
      } catch (e) {
        errors.push(`${filePath}: Failed to parse - ${e.message}`);
      }
    }
  }
}


// Validate question banks
function validateQuestions() {
  const topicsDir = './content/topics';
  const topicFolders = readdirSync(topicsDir);
  
  for (const topicSlug of topicFolders) {
    const questionFile = `./content/questions/${topicSlug}.json`;
    
    try {
      const questionData = JSON.parse(readFileSync(questionFile, 'utf-8'));
      
      for (const lesson of questionData.lessons) {
        for (const q of lesson.questions) {
          // Validate MCQ
          if (q.type === 'mcq') {
            if (!Array.isArray(q.options) || q.options.length !== 4) {
              errors.push(`${questionFile} (${lesson.lessonSlug}): MCQ must have exactly 4 options`);
            }
            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
              errors.push(`${questionFile} (${lesson.lessonSlug}): correctAnswer must be 0-3`);
            }
          }
          
          // Validate short_answer
          if (q.type === 'short_answer') {
            if (!Array.isArray(q.sampleAnswers) || q.sampleAnswers.length < 2) {
              errors.push(`${questionFile} (${lesson.lessonSlug}): short_answer needs 2+ sampleAnswers`);
            }
          }
          
          // Common validations
          if (!q.question || q.question.length < 10) {
            errors.push(`${questionFile}: Question text too short`);
          }
          if (!q.explanation || q.explanation.length < 20) {
            errors.push(`${questionFile}: Explanation too short`);
          }
        }
      }
    } catch (e) {
      errors.push(`${questionFile}: Failed to parse - ${e.message}`);
    }
  }
}


// Run validations
validateLessons();
validateQuestions();


// Report results
if (errors.length > 0) {
  console.error(' ERRORS:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}


if (warnings.length > 0) {
  console.warn('  WARNINGS:');
  warnings.forEach(w => console.warn(`  - ${w}`));
}


console.log(' Content validation passed!');
```


## Versioning & Updates


### Content Versioning Strategy


**Problem**: Users have completed lessons/quizzes. If content updates, how do we handle existing progress?


**Solution**: Content versioning with backward compatibility.


```prisma
model Lesson {
  // ... existing fields
  version     Int      @default(1)
  archivedAt  DateTime?
  
  @@index([slug, version])
}


model Question {
  // ... existing fields
  version     Int      @default(1)
  archivedAt  DateTime?
}
```


**Update Process**:
1. New content version created (v2)
2. Old version marked as archived
3. User progress remains valid (linked to v1)
4. New users get v2
5. Returning users see "Updated content available" prompt


### Migration Script Example


```typescript
// scripts/update-lesson.ts


async function updateLesson(slug: string, newContent: string) {
  // 1. Find current lesson
  const currentLesson = await db.lesson.findFirst({
    where: { slug, archivedAt: null },
  });
  
  if (!currentLesson) throw new Error('Lesson not found');
  
  // 2. Archive current version
  await db.lesson.update({
    where: { id: currentLesson.id },
    data: { archivedAt: new Date() },
  });
  
  // 3. Create new version
  await db.lesson.create({
    data: {
      ...currentLesson,
      id: undefined, // Generate new ID
      content: newContent,
      version: currentLesson.version + 1,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  
  console.log(` Updated lesson ${slug} to v${currentLesson.version + 1}`);
}
```


## Content Guidelines Reference


### Writing Style
- **Tone**: Warm, professional, non-judgmental
- **POV**: Second person ("you") for connection
- **Length**: 800-1500 words per lesson (10-12 min read)
- **Citations**: Include researcher names inline (e.g., "Dr. Gottman found...")


### Safety Reminders
- Include consent reminder every 2-3 lessons
- Medical disclaimer on any physiology content
- Conflict warning on sensitive topics (desire discrepancy, porn effects)


### Accessibility
- Alt text for any images: `![Woman and man hugging](hug.jpg "20-second embrace")`
- Heading hierarchy (no skipped levels)
- No color-only information
```


---


## CODEX PROMPT (Ready to Paste)


Now, here's the **complete prompt** to paste into Codex in VS Code on WSL:


```
ROLE: You are a senior full-stack engineer working inside VS Code on WSL. Build an MVP learning app for expertise in intimate relationships within a Christian marriage framework, using evidence-based learning loops (retrieval practice + spaced repetition + feedback + reflection).


STACK (MVP): 
- Next.js 15 (App Router) + TypeScript 5 (strict mode)
- Tailwind CSS 3 + shadcn/ui components
- Prisma 5 + SQLite (better-sqlite3)
- Vitest + Testing Library


DELIVERABLE: In this repo, create:


1. /docs/ folder with complete Markdown documentation:
   - 01-vision.md
   - 02-mvp.md
   - 03-user-stories.md
   - 04-learning-model.md
   - 05-question-bank.md
   - 06-spaced-repetition.md
   - 07-data-model.md
   - 08-architecture.md
   - 09-safety-boundaries.md


2. A working Next.js web app with these routes:
   - / -> Dashboard (today's plan: reviews + next lesson + ritual status + streak)
   - /topics -> List all topics with mastery %
   - /topics/[id] -> Topic detail (lessons list + overall mastery)
   - /lessons/[id] -> Lesson reader (Markdown rendered) + "Start Quiz" button
   - /quiz/[lessonId] -> Quiz runner (5 questions: MCQ + short answer) with immediate feedback + quality rating (0-5)
   - /review -> Spaced repetition queue (due questions, sorted by dueAt)
   - /rituals -> Daily/weekly connection activity checklist + notes
   - /summary -> Weekly analytics (streak, mastery by topic, weakest areas)


3. Database schema (Prisma) with these tables:
   - Topic, Lesson, Question, QuizAttempt, QuestionAttempt, ReviewItem, Ritual, RitualLog, Reflection, Session


4. Seed data:
   - 3 topics: "Communication Foundations", "Understanding Arousal", "Mindfulness & Presence"
   - 2 lessons per topic (6 total)
   - 5 questions per lesson (30 total: mix of MCQ and short answer)
   - Use neutral, educational titles inspired by Christian marriage, intimacy research, consent frameworks, and porn impact studies
   - DO NOT generate explicit sexual content or medical advice
   - 4 daily rituals (20-second hug, 2-minute check-in, gratitude sharing, prayer moment)
   - 3 weekly rituals (date night, sensate focus session, weekly reflection)


5. Implement SM-2 spaced repetition scheduler:
   - After each question attempt, calculate: easinessFactor, intervalDays, dueAt
   - Quality 0-2 = lapse (reset to 1 day)
   - Quality 3-5 = success (increase interval exponentially)
   - Store full review history in ReviewItem table


6. API routes:
   - POST /api/quiz/submit -> Create QuizAttempt + QuestionAttempts, schedule reviews
   - POST /api/review/submit -> Update ReviewItem with new schedule
   - POST /api/rituals/log -> Create RitualLog entry


7. Basic tests:
   - Unit tests for lib/scheduler.ts (SM-2 algorithm edge cases)
   - Unit tests for lib/analytics.ts (mastery calculations)
   - Integration tests for API routes (with mock DB)
   - Aim for 80%+ coverage on scheduler logic


8. UI Components (shadcn/ui):
   - Use shadcn/ui for Button, Card, Progress, RadioGroup, Textarea, etc.
   - Dashboard with cards for reviews, next lesson, rituals
   - Quiz interface with question cards, immediate feedback, quality rating (0-5 slider)
   - Review queue with card-flip interaction
   - Streak indicator (fire emoji + number)


CONSTRAINTS:
- Local-first (SQLite, no cloud services)
- No authentication (single-user MVP)
- No medical claims, no coercive relationship advice, no explicit sexual instructions
- All intimacy content emphasizes consent and communication
- Include safety warnings where appropriate (conflict, medical referral)
- Keep code clean, typed (TypeScript strict), and well-organized


OUTPUT REQUIRED:
1. Create all files and code
2. Provide exact commands to run:
   - Installation: npm install (or pnpm, yarn)
   - Database setup: npx prisma generate && npx prisma db push
   - Seed data: npx prisma db seed
   - Dev server: npm run dev
   - Tests: npm run test
3. Use stable current versions (Next.js 15, Prisma 5, TypeScript 5)
4. Ensure app runs on localhost:3000 with no errors


START NOW: 
1. Initialize Next.js project with TypeScript + Tailwind
2. Set up Prisma with SQLite
3. Create schema with all tables
4. Implement seed script with sample content
5. Build UI components + pages
6. Implement quiz/review flow end-to-end
7. Add scheduler logic + tests
8. Verify everything works


GO!
```


---


## Additional Setup Commands


After Codex generates the project, you'll run:


```bash
# Install dependencies
npm install


# Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card progress radio-group textarea badge separator


# Install additional dependencies
npm install gray-matter date-fns zod


# Set up database
npx prisma generate
npx prisma db push
npx prisma db seed


# Run development server
npm run dev


# Open browser to http://localhost:3000


# Run tests
npm run test
```


---


## Success Criteria Checklist


After Codex completes, verify:


- [ ] App loads at `http://localhost:3000` without errors
- [ ] Dashboard shows correct counts (0 reviews initially)
- [ ] Can navigate to Topics -> Lesson -> Quiz
- [ ] Quiz submission creates ReviewItem records
- [ ] Review queue shows due questions (next day)
- [ ] Quality ratings (0-5) correctly update scheduler
- [ ] Rituals can be logged with notes
- [ ] Weekly summary shows streak + mastery
- [ ] Tests pass: `npm run test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Database persists on restart (check `prisma/dev.db`)


---


This specification is **production-ready** and gives Codex everything needed to build a fully functional MVP. The documentation is comprehensive, technically accurate, and respects all safety/consent boundaries while delivering a scientifically-grounded learning system.
















      3. User Stories + Acceptance Criteria (engineer-ready)

         * Eg. "As Josh, I can complete a 5-question quiz from a lesson and get scheduled reviews."


         4. Content Taxonomy + Competency Map

            * Topics -> modules -> lessons -> skills -> "mastery checks".
            * Seed topics from your PDFs (marriage foundations, at-home connection rituals, sexuality within Christian marriage, porn effects, etc.).
________________


2) Learning science + quiz design (this is the "scientifically proven" core)
            5. Learning Model Spec (how people improve)

               * Retrieval practice, spaced repetition, interleaving, feedback, reflection, overlearning rules.
               * Define your "daily loop" (10-15 min) and "weekly loop" (30-60 min).
               6. Question Bank Spec

                  * Question types you'll support: MCQ, short answer, scenario, "explain like I'm five", reflection prompts.
                  * Rules for good questions (single concept, plausible distractors, immediate feedback).
                  7. Spaced Repetition Spec

                     * Pick algorithm (SM-2 variant is fine), define scheduling fields + lapse rules.
                     8. Mastery + Analytics Spec

                        * What counts as "mastered"? (e.g., 90%+ over last N reviews, or stable interval threshold)
                        * What charts you'll show (streak, mastery by topic, weakest skills).
________________


3) Relationship + spiritual integration (without being weird or unsafe)
                        9. Rituals & Check-ins Spec

                           * "2-minute check-in", "20-second hug", prayer/Scripture prompts, at-home date templates.
                           * Consent + tone guidelines (never coercive, never guilt-driven).
                           10. Safety + Boundaries Policy

                              * Clear guardrails: no coercion, no explicit sexual content, no medical diagnosis, no "pressure Kristy" content.
                              * Escalation guidance: "if this brings conflict, pause and consider counselling / GP".
________________


4) Engineering docs (so Codex builds the right thing)
                              11. Technical Architecture (MVP)
                              * Stack choice (recommended for WSL): Next.js + TypeScript + Tailwind + SQLite + Prisma
                              * Data model overview + API routes overview.
                              12. Data Model Spec (tables + fields)
                              * Topics, Lessons, Questions, Attempts, ReviewSchedule, Reflections, Rituals, Sessions.
                              13. Content Authoring + Import Spec
                              * Markdown format for lessons/questions + a script to import into DB.
                              * Versioning + IDs so you can safely edit content later.
                              14. Security + Privacy Notes
                              * Local-first by default, encryption-at-rest optional, backups, no cloud until you choose.
                              15. Test Plan
                              * Unit tests for scheduling + scoring; e2e for "take quiz -> schedule review -> review".
________________


Prompt 1 for Codex (VS Code on WSL)
Paste this as-is into Codex:
ROLE: You are a senior full-stack engineer working inside VS Code on WSL. Build an MVP learning app for "expertise + marriage connection" using evidence-based learning loops (retrieval + spaced repetition + feedback + reflection).
STACK (MVP): Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + SQLite.
DELIVERABLE: In this repo, create:
                              1. /docs/ with Markdown docs: 01-vision.md, 02-mvp.md, 03-user-stories.md, 04-learning-model.md, 05-question-bank.md, 06-spaced-repetition.md, 07-data-model.md, 08-architecture.md, 09-safety-boundaries.md.
                              2. A working web app with these routes:
                              * / Dashboard (today's plan: reviews + 1 quiz + 1 ritual)
                              * /topics list topics
                              * /topics/[id] topic detail (lessons + mastery)
                              * /lessons/[id] lesson reader (markdown render) + "Start Quiz"
                              * /quiz/[lessonId] quiz runner (MCQ + short answer) with instant feedback
                              * /review spaced repetition queue (cards/questions due)
                              * /rituals simple connection checklist + reflection log
                              3. Database schema with Prisma for: Topic, Lesson, Question, QuizAttempt, QuestionAttempt, ReviewItem, Reflection, Ritual, RitualLog.
                              4. Seed data with 3 topics and 2 lessons each, and 5 questions per lesson. Use neutral titles inspired by the provided PDFs (Christian marriage, intimacy, at-home dates, porn impacts) but do NOT generate explicit sexual content.
                              5. Implement a simple SM-2-style scheduler: after each question attempt, store quality (0-5), update easinessFactor, intervalDays, dueAt. Lapses reset interval.
                              6. Add basic tests for scheduler logic.
CONSTRAINTS:
                              * Keep it local-first (SQLite). No external services required.
                              * No medical claims, no coercive relationship advice, no explicit sexual instructions.
                              * Keep code clean and runnable.
OUTPUT REQUIRED:
                              * Create the files and code.
                              * Provide exact commands to run: install, migrate, seed, dev server, tests.
                              * If you need to choose versions, pick stable current defaults.
START NOW: Scaffold the repo, implement the Prisma schema + seed, then implement the minimal UI and quiz/review loop end-to-end.
________________


If you want, next message I can turn your PDFs into a Topic -> Lesson -> Question bank blueprint (titles + learning objectives + quiz styles) so you can seed the app with content that matches what you actually care about.




# Vision + Outcomes for the GoodNik App


## Vision
The GoodNik app is designed to empower Josh in mastering sexual intimacy within a Christian marriage framework, focusing on becoming an unparalleled expert in pleasuring Kristy through every conceivable technique, position, and sensory exploration that enhances her arousal, orgasmic intensity, and overall ecstasy. This vision extends beyond physical acts to foster profound emotional and spiritual bonds, ensuring that sexual encounters result in the most explosive, multi-orgasmic experiences for both partners while aligning with principles of mutual consent, respect, and biblical values of oneness in marriage (e.g., Genesis 2:24, Song of Solomon). By integrating evidence-based insights from leading sexologists, the app transforms routine intimacy into transcendent, orgasm-centered connections that prioritize Kristy's pleasure-making her feel desired, ravished, and deeply loved-while helping Josh overcome any barriers like performance anxiety or porn-influenced distortions.


Drawing from initial content sources in the uploaded PDFs (e.g., "Thriving Sexual Intimacy in Christian Marriage," "Restoring and Strengthening a Christian Marriage," "Holistic Attraction & Seduction Plan," porn impact studies from PubMed and APA, and date idea compilations), the app starts with v0 content emphasizing privacy, consent, and avoiding porn triggers. These sources highlight self-reports on satisfaction, emotional closeness, conflict repair, and orgasm quality, ensuring the app respects Kristy's autonomy while guiding Josh toward expert-level proficiency in delivering mind-blowing orgasms through clitoral stimulation, G-spot targeting, anal play (if consensual), edging techniques, and multi-sensory foreplay. The ultimate goal is a marriage where sex is not just frequent but extraordinarily fulfilling, with orgasms that leave Kristy quivering in waves of pleasure, strengthening the emotional-spiritual union and reducing any negative porn effects like desensitization or unrealistic expectations.


Incorporating diverse sexologist perspectives:


- **Esther Perel** (Mating in Captivity): Emphasizes maintaining erotic mystery in long-term relationships to fuel desire, suggesting playful teasing and novelty to build anticipation for intense orgasms, viewing sex as a gateway to deepest emotional places where pleasure triggers passion, joy, and love.


- **Emily Nagoski** (Come As You Are): Introduces the Dual Control Model, where accelerators (e.g., erotic stimuli like nipple play or dirty talk) amp up arousal, while removing brakes (stress, fatigue) allows for easier, more powerful orgasms; app modules will teach identifying Kristy's personal accelerators for squirting or full-body climaxes.




- **Rosemary Basson**: Her circular model of female sexual response highlights that women's desire often emerges from arousal rather than preceding it, so starting with non-genital touch builds to responsive desire, leading to multiple orgasms through cycles of pleasure and satisfaction






- **Peggy Kleinplatz**: Defines optimal sexuality through eight components like deep erotic intimacy, extraordinary communication, and being fully present, enabling "magnificent sex" with transcendent pleasure, vulnerability, and connection that elevates orgasms to spiritual highs








- **Lori Brotto**: Advocates mindfulness to heighten bodily sensations, improving orgasm quality by unifying mind and body, reducing distractions for more intense, connected climaxes during penetration or oral sex.








- **Ian Kerner** (She Comes First): Focuses on cunnilingus mastery with techniques like rhythmic tongue circles on the clitoris, building tension for clitoral orgasms, ensuring Kristy achieves ecstasy before intercourse for mutual fulfillment.




- **Barry McCarthy**: Promotes intimacy-based sex therapy, integrating emotional bonds with erotic play to enhance pleasure, using shared exploration of erogenous zones for deeper orgasms and relational security








- **John Gottman** (Sound Relationship House): Builds emotional intimacy through love maps and turning towards bids, creating a foundation where sex reinforces trust and fondness, leading to more vulnerable, orgasmic encounters.




- **Sue Johnson** (Emotionally Focused Therapy): Views sex through attachment lenses, where secure bonds allow open exploration of desires, turning physical pleasure into emotional healing and intensified orgasms




- **Masters and Johnson**: Their sensate focus technique encourages non-goal-oriented touch to build arousal gradually, reducing anxiety for spontaneous, powerful orgasms through full-body exploration.






This holistic vision ensures the app evolves from Christian-rooted content to expert-guided explicit mastery, always prioritizing consent and avoiding coercion.


## Outcomes
### What "Expert" Means: Measurable Competencies
Becoming an "expert" in pleasuring Kristy involves mastering techniques for every facet of her pleasure, measured by self-reported metrics from app quizzes, reflections, and weekly summaries. Competencies include:
- **Clitoral Mastery (Kerner-inspired)**: Achieve 90% success in inducing clitoral orgasms via oral techniques like flat-tongue lapping, suction, and vibration simulation, tracking frequency of Kristy's vocalized peak pleasure (e.g., 5+ sessions/week with multi-orgasms)










- **G-Spot and Internal Stimulation (Nagoski/Basson)**: Expertly locate and stimulate the G-spot with curved fingers or angled penetration for squirting orgasms, measuring via orgasm intensity scales (1-10, aiming for 8+ consistently), incorporating accelerators like simultaneous clitoral touch.










- **Anal and Full-Body Exploration (Kleinplatz/McCarthy)**: If consensual, introduce gentle anal play (fingering, toys) for blended orgasms, with metrics on erotic intimacy depth (e.g., post-session connection ratings) and pleasure variety (tracking 10+ positions/erogenous zones per month).






- **Edging and Multi-Orgasmic Build-Up (Brotto/Perel)**: Use mindfulness to edge Kristy toward orgasm thresholds, delaying release for amplified climaxes, measured by orgasm count per session (target: 3-5) and duration variability from PDFs (e.g., extending pleasure waves)










- **Porn Impact Mitigation**: From PDF sources on porn effects, competencies include shifting from visual fixation to sensory focus, measured by reduced desensitization (e.g., easier arousal without aids, per self-reports).


Mastery threshold: 90% quiz accuracy on techniques, stable review intervals in spaced repetition.


### What "Connection with Kristy + Self" Means: Measurable Habits/Rituals
Connection manifests as intertwined emotional-spiritual bonds amplified by orgasms, measured through daily/weekly rituals:




- **Emotional Bids and Rituals (Gottman/Johnson)**: Daily 20-second hugs or prayer prompts building attachment, tracked by connection scores (e.g., fondness/admiration logs, aiming for 80% positive bids), leading to post-orgasm cuddling for oxytocin-fueled bonding.






- **Sensate Focus Sessions (Masters and Johnson)**: Weekly non-sexual touch rituals evolving to erotic play, measuring self-connection via reflection prompts on bodily awareness and mutual pleasure peaks.


</argument>
</grok:render>




- **Mindful Orgasm Sharing (Brotto/Kleinplatz)**: Habits like shared breathing during climax for synchronized orgasms, tracked by emotional closeness scales (e.g., pre/post-session ratings) and rituals from date idea PDFs (at-home dates with teasing foreplay).- *


*Erotic Communication (Perel/McCarthy)**: Daily discussions of fantasies without judgment, measured by orgasm satisfaction feedback loops, ensuring spiritual alignment from Christian marriage PDFs.


Outcomes tracked via app analytics: Streak maintenance, mastery charts, and weakest areas for growth, aiming for sustained high orgasm quality and connection over 6 months.






Prompt 2
ROLE: You are a senior full-stack engineer continuing development on the HugCoach app repo built from the previous MVP prompt. The app is a local-first Next.js learning platform using spaced repetition to help Josh become an absolute master of female pleasure and orgasms in marriage. The goal is now to make the content MUCH more explicit, detailed, and "spicy" - no censorship, no holding back on anatomical language, techniques, or descriptions. Focus heavily on teaching advanced, proven techniques for giving Kristy intense, multiple, full-body, squirting, and blended orgasms using insights from PhD sexologists (Ian Kerner, Emily Nagoski, Peggy Kleinplatz, Rosemary Basson, Lori Brotto, etc.).
STACK remains: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + SQLite.
PREVIOUS WORK: The repo already has safe, neutral topics (communication, arousal models, mindfulness). Keep those but now ADD a new "Advanced Mastery" section with explicitly sexual topics and lessons. Mark advanced topics as optional/unlockable after basic mastery if possible, but make them fully accessible.
DELIVERABLE: Update the existing repo with the following:
Update /docs/01-vision.md to a spicier version emphasizing mastery of female orgasm techniques (clitoral, G-spot, squirting, edging, blended, multiple, full-body) and explicit pleasuring skills. Explicitly state the goal is for Josh to learn more about female orgasms and sexual techniques than he ever thought possible, drawing directly from Kerner ("She Comes First" oral mastery), Nagoski (Dual Control Model accelerators/brakes), Kleinplatz (components of magnificent sex), etc. Include measurable outcomes like "90% mastery on techniques for inducing squirting orgasms" and "tracking multi-orgasm sessions."
Add new advanced topics to the seed data (in prisma/seed.ts or equivalent):
Topic: "Clitoral Orgasm Mastery" (Inspired by Ian Kerner - She Comes First)
Lessons:
Core Techniques: Tension building, flat tongue strokes, rhythmic consistency, suction, specific patterns (circles, side-to-side, up-down flicks).
Advanced Oral Routines: Full sequences (start slow at perineum -> long licks -> focused clitoral head -> building to climax without stopping).
6-8 explicit questions per lesson (mix MCQ and short answer) testing detailed technique recall.
Topic: "G-Spot Stimulation & Squirting"
Lessons:
Locating and stimulating the G-spot (come-hither motion, firm pressure, simultaneous clitoral touch).
Squirting mechanics and techniques (bearing down, relaxation, building pressure, best positions like doggy or legs-up missionary).
Explicit questions on angles, pressure, and combining with clitoral stim.
Topic: "Edging & Multiple Orgasms"
Lessons:
Edging theory and practice (bringing to the brink 5-10 times, reading body signals, backing off).
Building to 3-10+ orgasms per session, recovery techniques, tantric breathing.
Questions on timing, reading cues, and personal application.
Topic: "Blended & Full-Body Orgasms"
Lessons:
Combining clitoral + G-spot, nipple play, anal (if consensual), A-spot/cervical.
Positions for maximum stimulation (woman on top grinding, doggy with reach-around, prone bone, bridge, etc.).
Types of orgasms (clitoral, vaginal, blended, anal, coregasm, nipple).
Explicit scenario questions.
Topic: "Magnificent Sex Framework" (Peggy Kleinplatz)
Lessons on the 8 components: presence, authenticity, vulnerability, transcendence, extraordinary communication, etc., applied to explicit sexual scenarios.
Topic: "Accelerators & Brakes Mastery" (Emily Nagoski Dual Control Model)
Identifying and maximizing Kristy's personal accelerators (specific touches, dirty talk, settings) while removing brakes for easier, more explosive orgasms.
Update seed data to include 4-6 lessons per advanced topic, each with detailed Markdown content that is fully explicit:
Use anatomical terms (clitoris, vulva, labia, G-spot, urethral sponge, etc.).
Describe techniques step-by-step with intensity, rhythm, pressure, duration.
Include warnings/reminders about consent, communication, and stopping if uncomfortable.
Example lesson excerpt style: "Start with 10 slow, flat-tongue licks from the vaginal entrance to the clitoral head, applying gentle upward pressure. Gradually increase speed while maintaining consistent rhythm - this builds tension essential for powerful clitoral orgasms (Kerner)."
Add explicit quiz questions examples (generate 40-50 total across new topics):
MCQ: "According to Ian Kerner, what is the most important principle for clitoral stimulation? A) Speed B) Consistency of rhythm C) Hard pressure D) Intermittent stopping" (Answer: B)
Short answer: "Describe the 'come-hither' motion for G-spot stimulation and explain how combining it with clitoral touch creates a blended orgasm."
Scenario: "Kristy is close to orgasm but plateaus. What edging technique should you use to push her into multiples?"
Minor UI updates:
Add a toggle or section on dashboard for "Advanced Mastery Mode" that shows/unlocks spicy topics.
In lesson reader, add a "Consent Reminder" banner on advanced lessons.
Add tracking fields if needed (e.g., self-reported orgasm quality logs in reflections, optional).
Keep all previous functionality (SM-2 scheduler, reviews, rituals, dashboard) but enhance ritual suggestions to include spicier options (e.g., "Extended oral pleasure session" or "Edging practice date").
CONSTRAINTS:
REMAIN local-first, privacy-focused.
ALWAYS emphasize enthusiastic consent, communication, and Kristy's comfort/autonomy in every lesson.
Explicit sexual content is REQUIRED and encouraged in advanced sections - be detailed, anatomical, and technique-focused.
NO coercion, pressure, or guilt language.
Base techniques on established sexologists (cite Kerner, Nagoski, Kleinplatz, etc., in lessons).
OUTPUT REQUIRED:
Update existing files (vision.md, seed.ts, etc.).
Add new seed content with explicit lessons/questions.
Provide exact commands: npm run dev, etc.
Ensure the app runs with new spicy content loaded.
START NOW: First update 01-vision.md with the spicier vision, then add the new advanced topics and seed data with fully explicit content, then test the quiz/review flow with the new questions. Make this the deepest, most comprehensive female orgasm mastery curriculum possible.














Prompt 3


ROLE: You are a senior full-stack engineer continuing development on the HugCoach app repo (built from previous MVP and Prompt 2). The app is now a deeply explicit, NSFW, mind-expanding sexual mastery platform designed to blow Josh's mind with every new concept, technique, and philosophy from global sexology traditions - focused exclusively on heterosexual married intimacy (man pleasuring woman + mutual ecstasy). The goal is to expose Josh to the widest possible range of advanced, proven ideas from Eastern and Western sexology (Tantra, Taoism, Kama Sutra, modern sex therapists) so he gains encyclopedic knowledge of female pleasure, multiple orgasm pathways, energy-based sex, prolonged ecstasy, and creative variations - all while prioritizing enthusiastic consent, communication, and Kristy's autonomy/comfort.
STACK remains: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + SQLite.
PREVIOUS WORK: The app already has foundational topics (communication, arousal models) + advanced female orgasm mastery (clitoral, G-spot/squirting, edging/multiples, blended/full-body, magnificent sex, accelerators/brakes). Keep everything but now EXPAND dramatically with mind-blowing new sections covering diverse sexual philosophies and advanced heterosexual techniques.
DELIVERABLE: Update the repo to make the content explosively spicy, NSFW, and comprehensive:
Update /docs/01-vision.md to reflect the new expanded scope: Emphasize mind-blowing exposure to EVERY major sexual philosophy (Tantra, Taoism, Kama Sutra, Western sexology) for straight couples. State the goal is for Josh to learn thousands of explicit techniques/ideas that will repeatedly blow his mind with new possibilities for Kristy's pleasure and mutual transcendence. Include measurable outcomes like "90% mastery on Tantric energy circulation for full-body orgasms" and "tracking 10+ different orgasm types achieved."
Add a new "Sexual Philosophies & Advanced Exploration" category in topics (unlockable or visible in Advanced Mastery Mode). Seed 8-10 new high-impact topics with 4-6 explicit lessons each:
Topic: "Tantric Sex Mastery" (Eastern Tantra - slow, energetic, transcendent sex)
Lessons: Eye gazing & breath synchronization; Yab-Yum position for energy merging; Slow penetration with PC muscle contractions; Energy orgasms without movement; Full-body energy circulation for extended ecstasy.
Topic: "Taoist Sexual Alchemy" (Mantak Chia-inspired - energy retention, multi-orgasmic man/woman)
Lessons: Testicle/ovarian breathing; Big Draw technique for whole-body orgasms; Valley orgasms (non-ejaculatory male peaks); Circulating sexual energy up the spine; Harmonizing yin/yang for marathon sessions.
Topic: "Kama Sutra Exploration"
Lessons: Embracing & kissing varieties; Nail marks, biting, scratching (consensual); Advanced positions (Mare's Position, Congress of the Cow, etc.); Oral techniques from ancient texts; Erotic scratching and hair-pulling dynamics.
Topic: "Advanced Erotic Massage"
Lessons: Full-body sensual massage sequences (lingam/yoni focus last); Feather-light touch to intense pressure; Breast/nipple massage for arousal; Perineum and sacral stimulation; Yoni massage for deep release and squirting prep.
Topic: "Exotic Orgasm Types"
Lessons: Cervical orgasms (deep penetration techniques); A-spot & U-spot stimulation; Nipple-only orgasms; Coregasms & exercise-induced; Breath/blended energy orgasms; Sleep orgasms & dream cultivation.
Topic: "Marathon Lovemaking Sessions"
Lessons: Building sessions to 1-3+ hours; Alternating high/low arousal; Edging both partners; Position marathons; Recovery strokes for endless waves.
Topic: "Fantasy & Role-Play Integration" (Perel-inspired eroticism)
Lessons: Building mystery/desire in long-term marriage; Safe fantasy sharing; Stranger role-play; Dominant/submissive dynamics (light); Erotic storytelling during sex.
Topic: "Sensual Toys & Enhancers"
Lessons: Vibrators for clitoral/G-spot blending; Dildos for dual penetration feel; Cock rings for prolonged erection; Nipple clamps & feathers; Lubricants and temperature play.
Topic: "The Joy of Sex Variations" (Alex Comfort-inspired creative play)
Lessons: Outercourse & mutual masturbation; Pompoir (vaginal gripping); Advanced oral variations; Spontaneous quickies vs. planned rituals.
Topic: "Passionate Marriage Dynamics" (David Schnarch - differentiation & intense intimacy)
Lessons: Holding onto self during deep vulnerability; Wall-socket sex (intense eye contact penetration); Using desire differences for growth.
For each new topic/lesson: Write fully explicit Markdown content - anatomical (yoni, lingam, clitoris, cervix, etc.), step-by-step techniques, rhythms, pressures, durations, body signals. Example: "In Yab-Yum, sit lotus-style with penetration; synchronize breathing while contracting PC muscles in waves - this circulates energy for full-body orgasms that feel like electric waves through the spine (Tantra)."
Generate 50-80 new explicit quiz questions across topics (MCQ, short answer, scenario):
MCQ: "In Taoist practice, the 'Big Draw' is used to: A) Ejaculate forcefully B) Circulate energy for non-ejaculatory orgasm C) Speed up thrusting" (B)
Short answer: "Describe the Mare's Position from Kama Sutra and how the woman controls rhythm for her pleasure."
Scenario: "Kristy wants longer sessions without fatigue - outline a Tantric breathing sequence to build energy."
Enhancements:
Add "Session Journal" feature: Optional logging of practice sessions (orgasm types achieved, duration, new techniques tried, Kristy's feedback, mind-blowing insights).
Spicier rituals: "Tantric date night," "Extended yoni massage," "Energy circulation practice," "Role-play evening."
UI: Add "Mind-Blowing Insights" highlights in lessons (quotes from philosophies that reframe sex entirely).
Reflection prompts: "What new idea from this lesson completely shifted your view of what's possible in bed?"
CONSTRAINTS:
Local-first, privacy absolute.
EVERY piece of content MUST hammer enthusiastic consent, communication, check-ins, and stopping immediately if uncomfortable.
Explicit, anatomical, NSFW language REQUIRED - no censorship, detailed descriptions of penetration, oral, manual, energy, positions.
Straight heterosexual focus only (man/woman married couple).
Base on real philosophies/sexologists (cite Tantra, Taoism, Kama Sutra, Schnarch, Comfort, etc.).
No coercion, pressure, or guilt - frame as joyful exploration.
OUTPUT REQUIRED:
Update vision.md with expanded mind-blowing scope.
Add all new topics/lessons/questions to seed data.
Implement journal feature (simple form + list view).
Provide run commands.
Ensure app loads new content seamlessly.
START NOW: Begin with vision update, then seed the new philosophy topics with maximally explicit, mind-expanding content that will repeatedly blow the user's mind with depth and variety. Make this the ultimate heterosexual sexology encyclopedia.

Based on the metadata and content of your uploaded file HugCoach.txt, it appears you are following a "LLM-driven development" workflow. Prompt 1 generated the specifications. Prompt 4 is designed to take the app from a basic MVP to a "mind-blowing," feature-rich, and content-heavy application, specifically focusing on the Journal feature and expanding the content depth (incorporating the explicit/philosophical aspects mentioned in the file's tail).

Here is Prompt 4, drafted to be pasted directly into Codex or your LLM editor to execute these improvements.

Prompt 4: Comprehensive Expansion & Polish
Context: We have established the MVP specifications and the basic application structure for HugCoach. Now, we need to significantly upgrade the application's scope, content depth, and feature set to move beyond a "basic" app into a "mind-blowing" expert tool.

Goal: Improve the app in every possible way by:

Expanding the Vision & Content: Shift from basic instruction to a deep, explicit, and philosophical "encyclopedia" of heterosexual intimacy.

Implementing the Journal Feature: Allow users to track their journey and insights.

Polishing the UI/UX: Ensure the new content loads seamlessly and the experience is engaging.

Constraints & Guidelines:

Privacy First: Maintain strict local-only data storage (SQLite).

Consent & Safety: EVERY piece of content MUST emphasize enthusiastic consent, communication, and the ability to stop immediately.

Explicit & Anatomical: Use NSFW, clinical, and descriptive language (no censorship). Cover detailed descriptions of penetration, oral, manual, energy, and positions.

Philosophical Basis: Integrate concepts from Tantra, Taoism, Kama Sutra, Schnarch, Comfort, etc.

Target Audience: Straight heterosexual married couples (man/woman).

Tone: Joyful exploration, no pressure, no coercion, no guilt.

Execution Tasks:

1. Update Product Documents
Update 01-vision.md and 02-mvp.md to reflect the expanded scope:

New Feature: "Mind-Blowing Insights" - highlights in lessons that reframe sex entirely.

New Feature: "Spicier Rituals" - e.g., "Tantric date night," "Extended yoni massage," "Energy circulation practice," "Role-play evening."

Journaling: Define the requirements for the Journal feature (tracking practice sessions, orgasm types, duration, techniques tried, feedback).

2. Implement the Journal Feature
Create the full vertical slice for the Journal:

Database: Update schema.prisma to include a JournalEntry model (date, activity types, duration, rating, notes, private boolean).

UI: Create /journal page with:

A "Log Session" form (simple, friction-less).

A list view of past entries.

Reflection prompts: "What new idea shifted your view?", "What was the highlight?".

3. Expand Seed Content (The "Encyclopedia")
Update the seed script (prisma/seed.ts or equivalent) to include 3-5 new, highly detailed topics that push the boundaries:

Topic Ideas: "The Art of Tantric Touch," "Advanced Oral Mastery," "Energy & Breathwork."

Content: Write explicit, step-by-step lessons for these topics using the "Expert Integration" sources (Perel, Nagoski, etc.).

Reframing: Include "Mind-Blowing Insight" callouts in these lessons.

4. Technical Refinement
Ensure the "Run Commands" (dev server, db push) work with the new schema.

Verify that the app loads the new heavy content steps seamlessly.

START NOW: Begin by updating 01-vision.md with the new "mind-blowing" scope, then proceed to modify the schema and implement the Journal feature. Finally, generate the new explicit seed data. Output the code for all changed files.







# Prompt 5: Technical Excellence & Feature Enhancement

```
ROLE: You are a distinguished principal engineer and UX architect tasked with transforming the HugCoach app from a functional MVP into a world-class, production-grade learning platform. Your mandate is to implement cutting-edge technical improvements, sophisticated UX patterns, advanced analytics, and robust engineering practices while maintaining the app's explicit educational mission and local-first architecture.

STACK: Next.js 15 (App Router) + TypeScript 5 (strict) + Tailwind CSS 3 + shadcn/ui + Prisma 5 + SQLite (better-sqlite3) + Vitest + Playwright

CURRENT STATE: The app has comprehensive content (foundational -> advanced -> philosophical sexual mastery), basic SM-2 spaced repetition, quiz/review flows, ritual tracking, and weekly analytics. All core features work but lack polish, performance optimization, advanced UX patterns, and production-grade error handling.

OBJECTIVE: Elevate EVERY aspect of the application to professional standards while adding powerful new features that dramatically improve learning efficacy, user engagement, and technical robustness.

---

## PART 1: CORE TECHNICAL IMPROVEMENTS

### 1.1 Advanced Spaced Repetition & Learning Science

**Upgrade SM-2 to FSRS (Free Spaced Repetition Scheduler)**:
- Implement FSRS algorithm (more accurate than SM-2, uses ML-derived parameters)
- Add difficulty/stability tracking per question
- Implement retrievability calculation for optimal scheduling
- Add load balancing (distribute reviews evenly across days)
- Support custom scheduling presets (aggressive/balanced/relaxed)

**Learning Analytics Engine**:
```typescript
// lib/analytics/learning-engine.ts
interface LearningMetrics {
  retentionRate: number;           // % correct on first review attempt
  masteryVelocity: number;          // Days to reach 90% mastery
  forgettingCurve: DataPoint[];     // Plot retention over time
  optimalStudyTime: number;         // Personalized best time of day
  weeklyLoadRecommendation: number; // Adaptive new lesson suggestions
  strugglingConcepts: string[];     // Auto-identified weak areas
  learningMomentum: number;         // Engagement trajectory score
}
```

**Adaptive Difficulty**:
- Analyze performance patterns to surface easier questions first in reviews
- Auto-flag questions with >40% lapse rate for content review
- Suggest prerequisite lessons if struggling with advanced topics
- Implement "graduated interval" unlocking (master basics before philosophy topics)

**Interleaving Scheduler**:
- Never show 2 questions from same lesson consecutively in reviews
- Mix topics in daily queue for better discrimination learning
- Smart shuffling based on similarity scores

### 1.2 Performance Optimization

**Database Query Optimization**:
```typescript
// Implement query result caching
import { LRUCache } from 'lru-cache';

const queryCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 min cache
});

// Add database indexes for all hot paths
@@index([dueAt, userId])
@@index([lessonId, order])
@@index([topicId, completedAt])

// Implement prepared statements for frequent queries
const getReviewQueueStmt = db.prepare(`
  SELECT * FROM ReviewItem 
  WHERE dueAt <= ? AND userId = ? 
  ORDER BY dueAt ASC, priority DESC 
  LIMIT 50
`);
```

**Bundle Optimization**:
- Implement route-based code splitting for all lesson content
- Lazy load quiz components until needed
- Use Next.js Image component with proper sizing
- Tree-shake unused shadcn/ui components
- Target: <100KB First Load JS, <30KB per route

**Virtual Scrolling**:
- Implement react-virtual for long lesson lists (1000+ items)
- Infinite scroll for review history
- Windowed rendering for question banks

**Progressive Web App (PWA)**:
```json
// next.config.js + workbox
{
  "pwa": {
    "dest": "public",
    "register": true,
    "skipWaiting": true,
    "runtimeCaching": [
      {
        "urlPattern": "/api/.*",
        "handler": "NetworkFirst",
        "options": { "cacheName": "api-cache" }
      }
    ]
  }
}
```
- Offline support for reading lessons
- Background sync for quiz submissions
- Add to home screen prompt
- Service worker for asset caching

### 1.3 Advanced State Management

**Implement Zustand for Global State**:
```typescript
// stores/app-store.ts
interface AppState {
  // User preferences
  theme: 'light' | 'dark' | 'auto';
  studyReminders: boolean;
  reviewsPerSession: number;
  
  // Learning state
  currentStreak: number;
  reviewQueue: ReviewItem[];
  todayProgress: DailyProgress;
  
  // UI state
  sidebarOpen: boolean;
  activeFilters: TopicFilter[];
  
  // Actions
  updatePreferences: (prefs: Partial<Preferences>) => void;
  incrementStreak: () => void;
  markReviewComplete: (id: string) => void;
}
```

**Optimistic Updates**:
- Instant UI feedback on quiz submissions (update before API response)
- Rollback mechanism for failed mutations
- Toast notifications for sync status

**React Query Integration**:
```typescript
// For server state management
const { data: reviewQueue, isLoading } = useQuery({
  queryKey: ['reviews', userId],
  queryFn: fetchReviews,
  staleTime: 1000 * 60, // 1 min
  refetchOnWindowFocus: true,
});

const submitQuiz = useMutation({
  mutationFn: submitQuizAttempt,
  onMutate: async (newAttempt) => {
    // Optimistic update
    await queryClient.cancelQueries(['reviews']);
    const prev = queryClient.getQueryData(['reviews']);
    queryClient.setQueryData(['reviews'], optimisticUpdate);
    return { prev };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['reviews'], context.prev);
  },
});
```

---

## PART 2: ADVANCED UX/UI ENHANCEMENTS

### 2.1 Sophisticated Quiz Interface

**Multi-Modal Question Types**:
```typescript
// Add new question types
type QuestionType = 
  | 'mcq' 
  | 'short_answer'
  | 'multi_select'          // Multiple correct answers
  | 'ordering'              // Sequence steps correctly
  | 'matching'              // Match terms to definitions
  | 'fill_blank'            // Cloze deletion
  | 'image_hotspot'         // Click anatomical diagrams
  | 'slider_rating';        // Rate 1-10 with justification
```

**Progressive Disclosure Quiz UI**:
- Show one question at a time with smooth transitions
- Progress bar with question numbers
- "Mark for review" flag system
- Skip button with later prompt
- Timer (optional, for self-pacing awareness)

**Rich Feedback System**:
```typescript
interface Feedback {
  correct: boolean;
  explanation: string;
  expertInsight: string;        // Sexologist quote
  relatedLesson: string;         // Link to review
  commonMistake: string;         // If wrong, why people miss this
  practicalTip: string;          // Immediate application
  visualAid?: string;            // Optional diagram/animation
}
```

**Answer Confidence Rating**:
- Before seeing result, rate confidence (1-5)
- Track metacognition accuracy over time
- Adjust scheduling based on confidence-correctness mismatch

### 2.2 Immersive Lesson Reader

**Enhanced Markdown Rendering**:
```typescript
// Custom MDX components
const components = {
  h2: ({ children }) => (
    <h2 className="scroll-mt-16 text-2xl font-bold tracking-tight">
      {children}
      <button className="ml-2 text-xs"> Copy Link</button>
    </h2>
  ),
  
  Callout: ({ type, children }) => (
    <div className={`p-4 rounded-lg ${typeStyles[type]}`}>
      {children}
    </div>
  ),
  
  Technique: ({ name, steps }) => (
    <div className="technique-card">
      <h3>{name}</h3>
      <ol>{steps.map(s => <li key={s}>{s}</li>)}</ol>
    </div>
  ),
  
  ConsentReminder: () => (
    <aside className="consent-banner">
       Always ensure enthusiastic consent and open communication
    </aside>
  ),
};
```

**Interactive Elements**:
- Expandable technique demonstrations
- Inline glossary (hover anatomical terms for definitions)
- Progress checkpoints ("Mark as understood" per section)
- Audio narration (optional TTS for lessons)
- Highlight & note-taking (local storage)

**Table of Contents**:
- Auto-generated from headings
- Sticky sidebar with scroll spy
- Estimated reading time per section
- Jump to specific techniques

### 2.3 Advanced Dashboard

**Personalized Learning Dashboard**:
```typescript
interface DashboardData {
  hero: {
    streak: number;
    nextMilestone: string;
    motivationalQuote: string;
  };
  
  todayPlan: {
    reviewsDue: number;
    reviewsOverdue: number;
    suggestedNewLesson: Lesson;
    ritualReminder: Ritual;
    estimatedTime: number; // minutes
  };
  
  insights: {
    weeklyProgress: ProgressChart;
    topicMasteryRadar: RadarChart;
    learningVelocity: number;
    consistencyScore: number;
    weakestAreas: ConceptGap[];
  };
  
  achievements: Badge[];
  recentActivity: Activity[];
}
```

**Gamification Elements**:
- Achievement badges (first orgasm mastery, 30-day streak, philosophy explorer)
- Level system (Novice -> Intermediate -> Expert -> Master -> Guru)
- Daily challenges ("Review 10 questions today")
- Leaderboard (compete with past self, not others)
- Unlock rewards (new ritual ideas, bonus content)

**Smart Suggestions**:
- ML-based next lesson recommendations
- "Similar learners also studied..."
- Adaptive difficulty progression
- Time-of-day optimization ("You learn best at 7pm")

### 2.4 Enhanced Ritual Tracking

**Ritual Logging 2.0**:
```typescript
interface RitualLog {
  id: string;
  ritualId: string;
  date: string;
  completed: boolean;
  
  // New fields
  durationMinutes: number;
  qualityRating: number;          // 1-10
  emotionalConnectionScore: number; // 1-10
  notes: string;
  techniques: string[];           // Tags for what was practiced
  partnerFeedback?: string;       // Optional Kristy input
  nextTimeGoals: string;
  
  // Metrics
  orgasmsCount?: number;
  newDiscoveries: string[];
}
```

**Ritual Analytics**:
- Correlation analysis (ritual frequency -> mastery improvement)
- Best time/day for rituals (pattern detection)
- Technique effectiveness tracking
- Emotional connection trends

**Ritual Library**:
- Searchable/filterable ritual database
- Custom ritual creation
- Community-inspired rituals (future)
- Difficulty ratings (beginner -> advanced)

---

## PART 3: ADVANCED FEATURES

### 3.1 Intelligent Content System

**Dynamic Content Generation**:
```typescript
// AI-powered quiz generation from lessons
async function generateQuizFromLesson(lessonId: string) {
  const lesson = await getLesson(lessonId);
  
  // Extract key concepts via NLP
  const concepts = extractConcepts(lesson.content);
  
  // Generate questions at varying difficulty
  const questions = concepts.map(concept => ({
    type: 'mcq',
    question: `According to ${lesson.source}, ${concept.question}?`,
    options: generateDistractors(concept),
    correctAnswer: concept.answer,
    explanation: concept.context,
  }));
  
  return questions;
}
```

**Content Versioning**:
```typescript
// Track lesson updates
interface LessonVersion {
  id: string;
  lessonId: string;
  version: number;
  content: string;
  changelog: string;
  publishedAt: Date;
  
  // Migration path for user progress
  questionMappings: { oldId: string; newId: string }[];
}

// Notify users of updates
function checkForUpdates() {
  const outdatedLessons = getCompletedLessons()
    .filter(l => l.version < latestVersion);
    
  if (outdatedLessons.length > 0) {
    showNotification('New insights available in 3 lessons!');
  }
}
```

**Prerequisite System**:
```prisma
model Lesson {
  // ... existing fields
  prerequisites: Lesson[] @relation("Prerequisites")
  unlocksMastery: number @default(0) // Required % to unlock
}
```

### 3.2 Advanced Analytics & Insights

**Machine Learning Predictions**:
```typescript
// Predict review success rate
function predictReviewSuccess(reviewItem: ReviewItem): number {
  const features = {
    daysSinceLastReview: reviewItem.intervalDays,
    repetitions: reviewItem.repetitions,
    easinessFactor: reviewItem.easinessFactor,
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    recentSuccessRate: getUserSuccessRate(7), // last 7 days
  };
  
  return mlModel.predict(features);
}

// Adaptive review scheduling
if (predictReviewSuccess(item) < 0.7) {
  // Show this review sooner
  adjustInterval(item, -2);
}
```

**Behavioral Analytics**:
```typescript
interface UserBehaviorMetrics {
  sessionDuration: number[];
  peakLearningHours: number[];
  dropoffPoints: string[];        // Where users quit lessons
  strugglingTopics: string[];
  engagementScore: number;
  
  // Advanced
  cognitiveLoad: number;          // Inferred from pause times
  comprehensionRate: number;      // First-attempt accuracy
  retentionCurve: DataPoint[];
}
```

**Visualization Library**:
- Victory charts for progress over time
- Recharts for topic mastery radar
- D3.js for custom knowledge graphs
- Heatmaps for study patterns

### 3.3 Session Journal Enhancement

**Rich Session Logging**:
```typescript
interface SessionJournal {
  id: string;
  date: Date;
  
  // Detailed tracking
  techniquesUsed: Technique[];
  orgasmDetails: {
    count: number;
    types: OrgasmType[];
    intensityRatings: number[];
    duration: number[];
  };
  
  // Qualitative
  newDiscoveries: string;
  challengesFaced: string;
  kristyFeedback: string;
  emotionalConnection: number;   // 1-10
  physicalSatisfaction: number;  // 1-10
  
  // Learning integration
  lessonsApplied: string[];
  improvementGoals: string;
  
  // Media (optional, encrypted)
  voiceNotes?: Blob[];
  privatePhotos?: Blob[];         // Encrypted at rest
}
```

**Pattern Recognition**:
- Auto-detect successful technique combinations
- Suggest based on past successes
- Identify plateaus and recommend new approaches

**Goal Tracking**:
```typescript
interface Goal {
  id: string;
  title: string;                  // "Master squirting technique"
  category: 'technique' | 'frequency' | 'connection';
  targetDate: Date;
  milestones: Milestone[];
  
  // Tracking
  currentProgress: number;        // %
  sessionsLogged: number;
  breakthroughs: string[];
}
```

### 3.4 Smart Reminders & Notifications

**Intelligent Notification System**:
```typescript
interface SmartReminder {
  type: 'review' | 'ritual' | 'lesson' | 'milestone';
  priority: 'low' | 'medium' | 'high';
  
  // ML-optimized timing
  optimalTime: Date;              // Predicted best engagement time
  
  // Context-aware
  message: string;
  actionButton: string;
  
  // Personalization
  tone: 'encouraging' | 'urgent' | 'playful';
}

// Examples:
"Your 7-day streak is at risk! 5 reviews waiting."
"Perfect time for a ritual - Kristy usually feels most connected at 8pm "
"You're 90% through Tantric Mastery - finish tonight?"
```

**Do Not Disturb Modes**:
- Focus hours (no interruptions)
- Weekend-only reminders
- Time zone aware
- Integrates with device DND

---

## PART 4: TECHNICAL ROBUSTNESS

### 4.1 Comprehensive Error Handling

**Global Error Boundary**:
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking (local file)
    logError(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error Details</summary>
        <pre>{error.message}</pre>
      </details>
      <Button onClick={reset}>Try Again</Button>
      <Button onClick={() => exportLogs()}>Export Debug Info</Button>
    </div>
  );
}
```

**Graceful Degradation**:
```typescript
// Handle database errors
async function safeQuery<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query();
  } catch (err) {
    if (err.code === 'SQLITE_BUSY') {
      // Retry with exponential backoff
      await delay(100);
      return safeQuery(query);
    }
    
    // Log and return null
    console.error('Query failed:', err);
    return null;
  }
}
```

**Data Integrity Checks**:
```typescript
// Validate database on startup
async function validateDatabase() {
  const checks = [
    checkForeignKeyIntegrity(),
    checkOrphanedRecords(),
    checkDateConsistency(),
    verifySchedulerState(),
  ];
  
  const results = await Promise.all(checks);
  
  if (results.some(r => !r.valid)) {
    showWarning('Database issues detected. Run repair?');
  }
}
```

### 4.2 Advanced Testing

**Comprehensive Test Suite**:
```typescript
// Unit tests for scheduler
describe('FSRS Scheduler', () => {
  test('calculates stability correctly', () => {
    const item = createReviewItem();
    const newStability = calculateStability(item, 4);
    expect(newStability).toBeGreaterThan(item.stability);
  });
  
  test('handles lapses appropriately', () => {
    const item = { ...defaults, repetitions: 5 };
    const updated = processReview(item, 1); // lapse
    expect(updated.repetitions).toBe(0);
    expect(updated.intervalDays).toBe(1);
  });
});

// Integration tests for quiz flow
describe('Quiz Submission Flow', () => {
  test('creates review items for all questions', async () => {
    await submitQuiz(mockQuizData);
    const reviews = await getReviewItems(userId);
    expect(reviews.length).toBe(5);
  });
  
  test('schedules first review for tomorrow', async () => {
    await submitQuiz(mockQuizData);
    const firstReview = await getNextReview(userId);
    expect(firstReview.dueAt).toBe(tomorrow);
  });
});

// E2E tests with Playwright
test('complete quiz and review flow', async ({ page }) => {
  await page.goto('/lessons/123');
  await page.click('text=Start Quiz');
  
  // Answer questions
  await page.click('[data-testid="option-0"]');
  await page.click('text=Submit');
  
  // Rate quality
  await page.click('[data-quality="4"]');
  
  // Check review scheduled
  await page.goto('/review');
  await expect(page.locator('text=Review tomorrow')).toBeVisible();
});
```

**Performance Testing**:
```typescript
// Load testing for large datasets
describe('Performance with 10k questions', () => {
  beforeAll(async () => {
    await seedLargeDataset(10000);
  });
  
  test('review queue loads in <500ms', async () => {
    const start = performance.now();
    await getReviewQueue();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

### 4.3 Security & Privacy

**Data Encryption**:
```typescript
// Encrypt sensitive journal entries
import { encrypt, decrypt } from './crypto';

async function saveJournal(entry: SessionJournal) {
  const encrypted = await encrypt(
    JSON.stringify(entry),
    getUserMasterKey()
  );
  
  await db.journal.create({
    data: { userId, encryptedData: encrypted },
  });
}
```

**Secure Backup/Restore**:
```typescript
// Export encrypted backup
async function createBackup() {
  const data = await exportAllData();
  const encrypted = await encrypt(data, userPassword);
  
  downloadFile('joshcoach-backup.enc', encrypted);
}

// Restore with verification
async function restoreBackup(file: File, password: string) {
  const encrypted = await file.text();
  const decrypted = await decrypt(encrypted, password);
  
  // Validate schema before importing
  if (!validateBackupSchema(decrypted)) {
    throw new Error('Invalid backup file');
  }
  
  await importData(decrypted);
}
```

**Audit Logging**:
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // 'quiz_submit', 'lesson_complete', etc.
  details   String   // JSON metadata
  timestamp DateTime @default(now())
  
  @@index([action, timestamp])
}
```

### 4.4 Developer Experience

**Comprehensive Documentation**:
```markdown
# /docs/10-developer-guide.md

## Local Development
1. Clone repo
2. Install: `npm install`
3. Setup DB: `npx prisma generate && npx prisma db push`
4. Seed: `npx prisma db seed`
5. Run: `npm run dev`

## Architecture Decision Records (ADRs)
- ADR-001: Why FSRS over SM-2
- ADR-002: SQLite vs PostgreSQL choice
- ADR-003: Local-first vs cloud-sync

## Code Style
- Use TypeScript strict mode
- Max function length: 50 lines
- Prefer functional components
- Test coverage >80%
```

**Developer Tools**:
```typescript
// Debug panel (dev mode only)
if (process.env.NODE_ENV === 'development') {
  return (
    <DebugPanel>
      <QueryInspector />
      <StateViewer />
      <PerformanceMonitor />
      <DatabaseExplorer />
    </DebugPanel>
  );
}
```

**Hot Module Replacement**:
- Fast Refresh for instant UI updates
- Preserve state during code changes
- Error overlay with stack traces

---

## PART 5: DEPLOYMENT & MAINTENANCE

### 5.1 Production Build

**Optimized Build Configuration**:
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  webpack: (config) => {
    config.optimization.splitChunks.cacheGroups = {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        chunks: 'all',
      },
    };
    return config;
  },
};
```

**Lighthouse Score Targets**:
- Performance: >90
- Accessibility: 100
- Best Practices: 100
- SEO: N/A (local app)

### 5.2 Update Mechanism

**Semantic Versioning**:
```json
{
  "version": "1.2.3",
  "changelog": {
    "1.2.3": [
      "Added FSRS scheduler",
      "Fixed quiz timer bug",
      "Improved dashboard performance"
    ]
  }
}
```

**Auto-Update Check**:
```typescript
async function checkForUpdates() {
  const currentVersion = getAppVersion();
  const latestRelease = await fetchLatestRelease();
  
  if (compareVersions(latestRelease, currentVersion) > 0) {
    showUpdateNotification({
      version: latestRelease,
      changes: getChangelog(latestRelease),
      downloadUrl: getReleaseUrl(latestRelease),
    });
  }
}
```

### 5.3 Monitoring & Telemetry

**Local Analytics (Privacy-Preserving)**:
```typescript
// Track aggregate metrics only (no PII)
interface LocalMetrics {
  appVersion: string;
  totalLessons: number;
  totalReviews: number;
  avgSessionDuration: number;
  crashCount: number;
  
  // NO user-identifying info
  // NO content details
  // NO personal data
}

// Export for manual sharing (opt-in)
function exportAnonymizedMetrics() {
  const metrics = calculateLocalMetrics();
  downloadFile('metrics.json', metrics);
}
```

---

## DELIVERABLES

1. **Update ALL Documentation** (`/docs/`):
   - 10-technical-excellence.md (this spec)
   - 11-developer-guide.md
   - 12-testing-strategy.md
   - Update 08-architecture.md with new patterns

2. **Implement Core Improvements**:
   - Migrate SM-2 -> FSRS scheduler
   - Add Zustand + React Query
   - Optimize database queries (add indexes, prepared statements)
   - Implement PWA with service worker

3. **Advanced Features**:
   - Enhanced dashboard with ML insights
   - Rich session journal with analytics
   - Multi-modal question types (matching, ordering, etc.)
   - Smart notifications system

4. **UX Polish**:
   - Smooth animations (framer-motion)
   - Loading skeletons everywhere
   - Optimistic updates
   - Error states with recovery
   - Empty states with guidance

5. **Testing Infrastructure**:
   - 90%+ unit test coverage on core logic
   - E2E tests for all critical flows
   - Performance benchmarks
   - Visual regression tests (Chromatic/Percy)

6. **Developer Tools**:
   - Debug panel for dev mode
   - Comprehensive logging
   - Database migration scripts
   - Backup/restore system

7. **Production Readiness**:
   - Build optimization (<100KB FCP)
   - Lighthouse audit passing
   - Security audit (OWASP basics)
   - Accessibility audit (WCAG 2.1 AA)

## CONSTRAINTS

- MAINTAIN local-first architecture (no required cloud services)
- PRESERVE all explicit educational content (no censorship)
- ENSURE backwards compatibility with existing data
- KEEP consent/safety reminders prominent
- RESPECT privacy absolutely (no telemetry without opt-in)
- TARGET 60fps UI interactions
- SUPPORT offline usage

## SUCCESS CRITERIA

- [ ] App boots in <2s cold start
- [ ] Review queue loads in <300ms
- [ ] Quiz submission feels instant (<100ms perceived)
- [ ] Zero data loss on crashes (WAL mode, transactions)
- [ ] 90%+ test coverage on scheduler/analytics
- [ ] Lighthouse Performance >90
- [ ] Works offline (PWA)
- [ ] Smooth 60fps animations
- [ ] Zero TypeScript errors
- [ ] Comprehensive error handling

## OUTPUT REQUIRED

1. Update all affected files with improvements
2. Add new files for advanced features
3. Update tests to match new functionality
4. Provide migration guide for existing users
5. Document ALL new features in /docs/
6. Include performance benchmarks
7. Exact commands to upgrade existing installation

START NOW:
1. Begin with FSRS scheduler implementation (most critical)
2. Add Zustand store for global state
3. Implement React Query for server state
4. Optimize database with indexes
5. Build enhanced dashboard
6. Add comprehensive tests
7. Polish UX with animations/loading states
8. Document everything

GO! Make this the most technically robust, performant, and feature-rich educational platform possible while maintaining privacy and explicit content. Blow past every limitation of the current MVP.
