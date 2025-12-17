import { prisma } from '@/lib/prisma';

export type RewardSummary = {
  xpEarned: number;
  sparksEarned: number;
  criticalSuccess: boolean;
  levelUp: boolean;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  title: string;
};

export function calculateLevel(xp: number): number {
  const rawLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
  return Math.max(1, rawLevel);
}

export function xpForLevel(level: number): number {
  const safeLevel = Math.max(1, level);
  return Math.pow(safeLevel - 1, 2) * 100;
}

export function xpForNextLevel(level: number): number {
  const safeLevel = Math.max(1, level);
  return Math.pow(safeLevel, 2) * 100;
}

export function levelTitle(level: number): string {
  if (level >= 20) return 'Intimacy Sage';
  if (level >= 15) return 'Intimacy Guide';
  if (level >= 10) return 'Intimacy Adept';
  if (level >= 5) return 'Rising Partner';
  return 'Steady Starter';
}

export async function getOrCreateUser() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    return existing;
  }
  return prisma.user.create({
    data: {
      currentXP: 0,
      level: 1,
      currency: 0
    }
  });
}

async function awardAchievement(userId: string, slug: string) {
  const achievement = await prisma.achievement.findUnique({ where: { slug } });
  if (!achievement) return;
  await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id
      }
    },
    update: {},
    create: {
      userId,
      achievementId: achievement.id
    }
  });
}

function rollCritical(rng: () => number) {
  return rng() < 0.1;
}

function normalizeSparks(xpEarned: number) {
  return Math.max(5, Math.round(xpEarned / 10));
}

async function applyReward(userId: string, xpEarned: number, sparksEarned: number): Promise<RewardSummary> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const newXP = user.currentXP + xpEarned;
  const newLevel = calculateLevel(newXP);
  const levelUp = newLevel > user.level;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      currentXP: newXP,
      level: newLevel,
      currency: user.currency + sparksEarned
    }
  });

  return {
    xpEarned,
    sparksEarned,
    criticalSuccess: false,
    levelUp,
    level: updated.level,
    currentXP: updated.currentXP,
    nextLevelXP: xpForNextLevel(updated.level),
    title: levelTitle(updated.level)
  };
}

export async function awardQuizCompletion({
  quizAttemptId,
  correctCount,
  totalQuestions,
  durationSeconds,
  rng = Math.random
}: {
  quizAttemptId: string;
  correctCount: number;
  totalQuestions: number;
  durationSeconds?: number | null;
  rng?: () => number;
}): Promise<RewardSummary> {
  const user = await getOrCreateUser();

  const baseXP = 40 + totalQuestions * 5;
  const accuracyBonus = Math.round((correctCount / Math.max(totalQuestions, 1)) * 40);
  let speedBonus = 0;
  if (typeof durationSeconds === 'number') {
    if (durationSeconds <= totalQuestions * 12) {
      speedBonus = 20;
    } else if (durationSeconds <= totalQuestions * 20) {
      speedBonus = 10;
    }
  }

  let xpEarned = baseXP + accuracyBonus + speedBonus;
  const criticalSuccess = rollCritical(rng);
  if (criticalSuccess) {
    xpEarned *= 2;
  }

  const sparksEarned = normalizeSparks(xpEarned);
  const summary = await applyReward(user.id, xpEarned, sparksEarned);

  await prisma.quizAttempt.update({
    where: { id: quizAttemptId },
    data: { timeSpent: durationSeconds ? Math.round(durationSeconds) : null }
  });

  if (correctCount === totalQuestions) {
    await awardAchievement(user.id, 'quiz-master');
  }

  if (user.currentXP === 0) {
    await awardAchievement(user.id, 'first-quiz');
  }

  return {
    ...summary,
    criticalSuccess
  };
}

export async function awardRitualLog({
  shared = false,
  rng = Math.random
}: {
  shared?: boolean;
  rng?: () => number;
}): Promise<RewardSummary> {
  const user = await getOrCreateUser();
  const baseXP = 80;
  const connectionBonus = shared ? 30 : 0;
  let xpEarned = baseXP + connectionBonus;
  const criticalSuccess = rollCritical(rng);
  if (criticalSuccess) {
    xpEarned *= 2;
  }

  const sparksEarned = normalizeSparks(xpEarned);
  const summary = await applyReward(user.id, xpEarned, sparksEarned);

  await awardAchievement(user.id, 'first-hug');

  return {
    ...summary,
    criticalSuccess
  };
}
