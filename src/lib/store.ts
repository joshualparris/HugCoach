export type StoreItem = {
  id: 'streak-freeze' | 'rose-theme' | 'spicy-dice';
  name: string;
  description: string;
  cost: number;
  reward: {
    streakFreezes?: number;
    theme?: string;
    spicyDiceUnlocked?: boolean;
  };
};

export const storeItems: StoreItem[] = [
  {
    id: 'streak-freeze',
    name: 'Streak Freeze',
    description: 'Protects your streak for one missed day.',
    cost: 120,
    reward: { streakFreezes: 1 }
  },
  {
    id: 'rose-theme',
    name: 'Rose Theme',
    description: 'Unlock a warm rose accent theme for later.',
    cost: 200,
    reward: { theme: 'rose' }
  },
  {
    id: 'spicy-dice',
    name: 'Spicy Dice',
    description: 'Unlock a date-night dice roller.',
    cost: 150,
    reward: { spicyDiceUnlocked: true }
  }
];
