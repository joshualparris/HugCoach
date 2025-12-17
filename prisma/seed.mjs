import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const topics = [
  {
    title: 'Communication Foundations',
    description: 'Build trust, safety, and emotional connection through everyday communication skills.',
    order: 1,
    lessons: [
      {
        title: 'Active Listening & Bids for Connection',
        slug: 'active-listening-bids',
        content: `# Active Listening & Bids for Connection

## Learning Objectives
- Define a "bid" for connection
- Practice turning toward responses
- Recognize habits that erode trust

## Core Idea
Small moments shape the relationship. A "bid" is any attempt to connect: a comment, a question, a touch, or a request. Turning toward bids builds closeness over time.

## How to Practice
1. Notice the bid (a sigh, a request, or a question).
2. Pause and make eye contact.
3. Respond with curiosity or appreciation.

## Try This
At least once today, respond to a bid with a full-sentence reply instead of a quick "uh-huh."`,
        estimatedMinutes: 12,
        order: 1,
        learningObjectives: [
          'Define a bid for connection',
          'Identify turning toward responses',
          'Name habits that reduce connection'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'In Gottman language, what is a "bid"?',
            options: [
              'A request or attempt to connect',
              'A demand to solve a conflict',
              'A long speech about feelings',
              'A rule for household chores'
            ],
            correctAnswer: '0',
            explanation: 'A bid is any attempt to connect, big or small.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'Which is an example of turning toward a bid?',
            options: [
              'Ignoring the comment and checking your phone',
              'Saying "tell me more" and making eye contact',
              'Changing the subject to something else',
              'Responding with a sarcastic joke'
            ],
            correctAnswer: '1',
            explanation: 'Turning toward means responding with attention or curiosity.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'Why do small bids matter?',
            options: [
              'They are easier to ignore than conflicts',
              'They build long-term trust through repeated moments',
              'They only matter when the relationship is new',
              'They replace the need for direct conversation'
            ],
            correctAnswer: '1',
            explanation: 'Repeatedly turning toward small bids builds trust over time.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Write one sentence you could use to show you heard your partner.',
            correctAnswer: [
              'It sounds like today was stressful for you.',
              'I hear you saying you need some quiet time.'
            ],
            explanation: 'Reflecting back what you heard helps your partner feel understood.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'Describe a simple daily ritual that signals attention and care.',
            correctAnswer: [
              'A brief check-in at dinner about highs and lows.',
              'A 20-second hug after work.'
            ],
            explanation: 'Rituals create predictable moments of connection.',
            order: 5
          }
        ]
      },
      {
        title: 'Consent Conversations & Boundaries',
        slug: 'consent-conversations-boundaries',
        content: `# Consent Conversations & Boundaries

## Learning Objectives
- Define consent as ongoing and mutual
- Use check-ins to build safety
- Identify and respect boundaries

## Core Idea
Consent is an ongoing conversation, not a one-time checkbox. It builds trust, reduces anxiety, and strengthens intimacy.

## Practical Language
- "How does this feel?"
- "Do you want to keep going?"
- "We can slow down or stop anytime."

## Try This
Practice a short check-in today about comfort and preferences in a low-pressure context.`,
        estimatedMinutes: 10,
        order: 2,
        learningObjectives: [
          'Explain consent as ongoing and mutual',
          'Use check-ins to build safety',
          'Respect boundaries without pressure'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'Which statement best describes consent?',
            options: [
              'A one-time yes at the start of a relationship',
              'Ongoing, mutual agreement that can change',
              'Only needed when trying something new',
              'Implied by marriage'
            ],
            correctAnswer: '1',
            explanation: 'Consent is ongoing and can change at any time.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'A healthy boundary is best described as:',
            options: [
              'A rule meant to control the other person',
              'A personal limit shared with respect',
              'Something you never talk about',
              'A reason to avoid any discussion'
            ],
            correctAnswer: '1',
            explanation: 'Boundaries are personal limits shared respectfully.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'Which check-in phrase supports consent?',
            options: [
              'You should be fine with this by now',
              'Tell me if this is okay',
              'Let us just get it over with',
              'I already know what you want'
            ],
            correctAnswer: '1',
            explanation: 'Consent is supported by asking and listening.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Write one respectful way to pause or slow down during intimacy.',
            correctAnswer: [
              'Can we slow down for a moment?',
              'Let us pause and check in.'
            ],
            explanation: 'Clear, calm language keeps safety and trust intact.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'What is one benefit of consent check-ins?',
            correctAnswer: [
              'They build trust and reduce anxiety.',
              'They help both partners feel safe and heard.'
            ],
            explanation: 'Check-ins keep both partners comfortable and connected.',
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: 'Understanding Arousal',
    description: 'Learn how arousal works and how context shapes desire.',
    order: 2,
    lessons: [
      {
        title: 'The Dual Control Model',
        slug: 'dual-control-model',
        content: `# The Dual Control Model

## Learning Objectives
- Explain accelerators and brakes
- Identify common contextual factors
- Apply the model to daily life

## Core Idea
Arousal is shaped by two systems: accelerators (what turns you on) and brakes (what slows you down). Both matter. Removing brakes can be as important as adding accelerators.

## Examples
- Accelerators: affection, novelty, feeling understood
- Brakes: stress, fatigue, feeling rushed

## Try This
List two accelerators and two brakes for each partner, then compare notes.`,
        estimatedMinutes: 12,
        order: 1,
        learningObjectives: [
          'Define accelerators and brakes',
          'Identify context that affects desire',
          'Apply the model in conversation'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'In the Dual Control Model, "brakes" refer to:',
            options: [
              'Physical fitness routines',
              'Factors that slow down arousal',
              'Only medical conditions',
              'Rules set by one partner'
            ],
            correctAnswer: '1',
            explanation: 'Brakes are factors that reduce arousal or interest.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'Which is an example of an accelerator?',
            options: [
              'Feeling rushed',
              'Lack of sleep',
              'Feeling emotionally connected',
              'An unresolved argument'
            ],
            correctAnswer: '2',
            explanation: 'Connection and safety often act as accelerators.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'Why do brakes matter in long-term relationships?',
            options: [
              'They are irrelevant after the honeymoon phase',
              'They can quietly reduce desire even when attraction is high',
              'They only affect one partner',
              'They replace the need for communication'
            ],
            correctAnswer: '1',
            explanation: 'Brakes can reduce desire even when love and attraction are strong.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Name one accelerator and one brake you have noticed recently.',
            correctAnswer: [
              'Accelerator: time to talk; Brake: stress from work.',
              'Accelerator: affection; Brake: fatigue.'
            ],
            explanation: 'Personal awareness helps you make small adjustments.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'How could you reduce a brake this week?',
            correctAnswer: [
              'Plan a lighter evening to reduce fatigue.',
              'Resolve a small conflict before date night.'
            ],
            explanation: 'Small changes can remove friction and increase comfort.',
            order: 5
          }
        ]
      },
      {
        title: 'Responsive vs. Spontaneous Desire',
        slug: 'responsive-vs-spontaneous-desire',
        content: `# Responsive vs. Spontaneous Desire

## Learning Objectives
- Compare spontaneous and responsive desire
- Normalize different desire patterns
- Use language that avoids pressure

## Core Idea
Some people feel desire first, then seek closeness (spontaneous). Others feel desire after connection or touch begins (responsive). Both are normal.

## What Helps
- Low-pressure invitations
- Warm, non-demanding touch
- Clear permission to say no

## Try This
Ask, "What helps you feel open to connection?" and listen without debate.`,
        estimatedMinutes: 11,
        order: 2,
        learningObjectives: [
          'Define spontaneous vs responsive desire',
          'Normalize different desire patterns',
          'Use low-pressure invitations'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'Spontaneous desire is best described as:',
            options: [
              'Desire that appears after touch begins',
              'Desire that arises without a specific trigger',
              'Desire that only occurs in new relationships',
              'Desire that can be forced with effort'
            ],
            correctAnswer: '1',
            explanation: 'Spontaneous desire can appear without a trigger.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'Responsive desire often appears after:',
            options: [
              'Connection or affectionate touch',
              'A long argument',
              'Feeling rushed',
              'No interaction at all'
            ],
            correctAnswer: '0',
            explanation: 'Responsive desire grows after connection or touch begins.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'Which invitation is most supportive of responsive desire?',
            options: [
              'We should do this because we always do',
              'You owe me tonight',
              'Would you be open to some cuddling?',
              'If you loved me you would want this'
            ],
            correctAnswer: '2',
            explanation: 'Low-pressure invitations support safety and openness.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Write a low-pressure invitation that respects a possible "no."',
            correctAnswer: [
              'Would you be open to spending time together? It is okay to say no.',
              'No pressure, but I would love to connect if you are up for it.'
            ],
            explanation: 'Permission to decline removes pressure.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'Why is it important to normalize different desire patterns?',
            correctAnswer: [
              'It reduces shame and conflict.',
              'It helps both partners feel understood.'
            ],
            explanation: 'Normalizing differences increases empathy and patience.',
            order: 5
          }
        ]
      }
    ]
  },
  {
    title: 'Mindfulness & Presence',
    description: 'Create calm, present moments that deepen connection.',
    order: 3,
    lessons: [
      {
        title: 'Sensate Focus Basics',
        slug: 'sensate-focus-basics',
        content: `# Sensate Focus Basics

## Learning Objectives
- Explain the goal of sensate focus
- Practice non-goal-oriented touch
- Reduce performance pressure

## Core Idea
Sensate focus is a structured exercise that emphasizes touch, curiosity, and presence instead of performance. The goal is to notice sensations without rushing.

## Practice Tips
- Set aside time with no pressure for a specific outcome.
- Focus on temperature, texture, and pressure.
- Pause and check in often.

## Try This
Schedule a short session with a clear start and end time to keep it safe and low pressure.`,
        estimatedMinutes: 12,
        order: 1,
        learningObjectives: [
          'Define sensate focus goals',
          'Practice non-goal-oriented touch',
          'Reduce performance pressure'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'The main goal of sensate focus is to:',
            options: [
              'Achieve a specific outcome quickly',
              'Notice sensations with curiosity',
              'Avoid any physical touch',
              'Create competition between partners'
            ],
            correctAnswer: '1',
            explanation: 'Sensate focus centers on awareness, not performance.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'Which guideline best fits sensate focus?',
            options: [
              'Keep a strict score',
              'Avoid check-ins to stay in the moment',
              'Set a time limit to reduce pressure',
              'Only do it when both partners are exhausted'
            ],
            correctAnswer: '2',
            explanation: 'Time limits and check-ins help reduce pressure.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'What is a helpful mindset during sensate focus?',
            options: [
              'Curiosity and noticing',
              'Judging the quality of the moment',
              'Rushing to the next step',
              'Silence even when uncomfortable'
            ],
            correctAnswer: '0',
            explanation: 'Curiosity keeps attention on sensations.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Describe one way to reduce performance pressure during touch.',
            correctAnswer: [
              'Agree that the goal is only to notice sensations.',
              'Set a short time limit and check in.'
            ],
            explanation: 'Clear intentions reduce pressure and anxiety.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'Why is curiosity helpful in sensate focus?',
            correctAnswer: [
              'It helps you stay present and relaxed.',
              'It shifts attention from outcomes to experience.'
            ],
            explanation: 'Curiosity keeps the focus on experience rather than results.',
            order: 5
          }
        ]
      },
      {
        title: 'Mindfulness for Intimacy',
        slug: 'mindfulness-for-intimacy',
        content: `# Mindfulness for Intimacy

## Learning Objectives
- Define mindfulness in simple terms
- Use grounding techniques to stay present
- Apply mindfulness to reduce distraction

## Core Idea
Mindfulness means paying attention to the present moment with kindness. In intimacy, it helps reduce distraction and deepen connection.

## Simple Techniques
- Slow, steady breathing
- Noting one sensation at a time
- Gentle check-ins without judgment

## Try This
Use a 60-second breathing pause before a conversation or ritual.`,
        estimatedMinutes: 10,
        order: 2,
        learningObjectives: [
          'Define mindfulness',
          'Use grounding techniques',
          'Reduce distraction with gentle focus'
        ],
        questions: [
          {
            type: 'mcq',
            question: 'Mindfulness is best described as:',
            options: [
              'Avoiding all thoughts',
              'Paying attention to the present moment with kindness',
              'Only meditating for long periods',
              'Rushing through difficult emotions'
            ],
            correctAnswer: '1',
            explanation: 'Mindfulness is present-moment attention without judgment.',
            order: 1
          },
          {
            type: 'mcq',
            question: 'Which technique supports mindfulness during connection?',
            options: [
              'Fast, shallow breathing',
              'Noticing one sensation at a time',
              'Multitasking while talking',
              'Ignoring discomfort'
            ],
            correctAnswer: '1',
            explanation: 'Focusing on one sensation helps attention stay present.',
            order: 2
          },
          {
            type: 'mcq',
            question: 'Why do brief pauses help?',
            options: [
              'They force the conversation to stop',
              'They calm the nervous system and reduce distraction',
              'They avoid any emotion',
              'They replace communication'
            ],
            correctAnswer: '1',
            explanation: 'Pauses settle the body and reduce distraction.',
            order: 3
          },
          {
            type: 'short_answer',
            question: 'Write one grounding technique you could use today.',
            correctAnswer: [
              'Three slow breaths while noticing the chair or floor.',
              'Notice three things you can see and hear.'
            ],
            explanation: 'Grounding anchors attention in the present.',
            order: 4
          },
          {
            type: 'short_answer',
            question: 'How can mindfulness help communication?',
            correctAnswer: [
              'It reduces reactivity and improves listening.',
              'It keeps attention on the speaker.'
            ],
            explanation: 'Mindful attention supports calm, clear communication.',
            order: 5
          }
        ]
      }
    ]
  }
];

const rituals = [
  {
    title: '20-second hug',
    description: 'Share a slow, full-body hug for 20 seconds to reconnect.',
    type: 'daily',
    order: 1
  },
  {
    title: '2-minute check-in',
    description: 'Ask: "How are you really doing today?" and listen without fixing.',
    type: 'daily',
    order: 2
  },
  {
    title: 'Gratitude sharing',
    description: 'Name one specific thing you appreciated about your partner today.',
    type: 'daily',
    order: 3
  },
  {
    title: 'Prayer or quiet moment',
    description: 'Share a brief prayer or quiet moment of reflection together.',
    type: 'daily',
    order: 4
  },
  {
    title: 'At-home date night',
    description: 'Plan a simple, intentional date at home with phones away.',
    type: 'weekly',
    order: 1
  },
  {
    title: 'Sensate focus session',
    description: 'Schedule a low-pressure touch session focused on presence.',
    type: 'weekly',
    order: 2
  },
  {
    title: 'Weekly reflection',
    description: 'Review the week and pick one small area to improve together.',
    type: 'weekly',
    order: 3
  }
];

async function main() {
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.reviewItem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.ritualLog.deleteMany();
  await prisma.ritual.deleteMany();

  for (const topic of topics) {
    await prisma.topic.create({
      data: {
        title: topic.title,
        description: topic.description,
        order: topic.order,
        lessons: {
          create: topic.lessons.map((lesson) => ({
            title: lesson.title,
            slug: lesson.slug,
            content: lesson.content,
            estimatedMinutes: lesson.estimatedMinutes,
            order: lesson.order,
            learningObjectives: JSON.stringify(lesson.learningObjectives),
            questions: {
              create: lesson.questions.map((question) => ({
                type: question.type,
                question: question.question,
                options: question.options ? JSON.stringify(question.options) : null,
                correctAnswer: Array.isArray(question.correctAnswer)
                  ? JSON.stringify(question.correctAnswer)
                  : question.correctAnswer,
                explanation: question.explanation,
                order: question.order
              }))
            }
          }))
        }
      }
    });
  }

  await prisma.ritual.createMany({ data: rituals });

  await prisma.user.create({
    data: {
      currentXP: 0,
      level: 1,
      currency: 0
    }
  });

  await prisma.achievement.createMany({
    data: [
      {
        slug: 'first-hug',
        name: 'First Hug',
        description: 'Log your first ritual together.',
        icon: '🤝',
        condition: 'Log any ritual once.'
      },
      {
        slug: 'first-quiz',
        name: 'First Quiz',
        description: 'Complete your first quiz.',
        icon: '✅',
        condition: 'Finish a quiz once.'
      },
      {
        slug: 'quiz-master',
        name: 'Quiz Master',
        description: 'Score 100% on a quiz.',
        icon: '🏆',
        condition: 'Perfect quiz score.'
      },
      {
        slug: 'seven-day-streak',
        name: '7-Day Streak',
        description: 'Keep a 7-day activity streak.',
        icon: '🔥',
        condition: 'Record activity 7 days in a row.'
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
