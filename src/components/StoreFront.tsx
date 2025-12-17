"use client";

import { useState } from 'react';
import type { StoreItem } from '@/lib/store';

type StoreFrontProps = {
  items: StoreItem[];
  currency: number;
  streakFreezes: number;
  ownedThemes: string[];
  spicyDiceUnlocked: boolean;
};

export default function StoreFront({
  items,
  currency: initialCurrency,
  streakFreezes: initialStreakFreezes,
  ownedThemes: initialThemes,
  spicyDiceUnlocked: initialDice
}: StoreFrontProps) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [streakFreezes, setStreakFreezes] = useState(initialStreakFreezes);
  const [ownedThemes, setOwnedThemes] = useState(initialThemes);
  const [spicyDiceUnlocked, setSpicyDiceUnlocked] = useState(initialDice);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePurchase(itemId: StoreItem['id']) {
    setMessage(null);
    setLoading(itemId);
    const res = await fetch('/api/store/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId })
    });
    setLoading(null);

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Purchase failed.');
      return;
    }

    setCurrency(data.currency);
    setStreakFreezes(data.streakFreezes);
    setOwnedThemes(data.ownedThemes ?? []);
    setSpicyDiceUnlocked(Boolean(data.spicyDiceUnlocked));
    setMessage('Purchase complete.');
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Your balance</h2>
        <p className="mt-1 text-sm text-muted-foreground">{currency} Sparks</p>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">Streak freezes</p>
            <p>{streakFreezes}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Themes</p>
            <p>{ownedThemes.length ? ownedThemes.join(', ') : 'None yet'}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Spicy dice</p>
            <p>{spicyDiceUnlocked ? 'Unlocked' : 'Locked'}</p>
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {item.cost} Sparks
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            <button
              type="button"
              onClick={() => handlePurchase(item.id)}
              disabled={loading === item.id}
              className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading === item.id ? 'Purchasing...' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
