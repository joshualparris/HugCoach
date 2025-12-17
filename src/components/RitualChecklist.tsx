'use client';

import { useState } from 'react';
import LevelUpModal from '@/components/LevelUpModal';

type Ritual = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
};

type RitualChecklistProps = {
  rituals: Ritual[];
  completedIds: string[];
};

export default function RitualChecklist({ rituals, completedIds }: RitualChecklistProps) {
  const [completed, setCompleted] = useState(new Set(completedIds));
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [reward, setReward] = useState<{
    xpEarned: number;
    sparksEarned: number;
    criticalSuccess: boolean;
    levelUp: boolean;
    level: number;
    title: string;
  } | null>(null);
  const [levelUpOpen, setLevelUpOpen] = useState(false);

  async function handleLog(ritualId: string) {
    if (completed.has(ritualId)) return;
    setLoadingId(ritualId);
    const res = await fetch('/api/rituals/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ritualId, shared })
    });
    setLoadingId(null);
    if (res.ok) {
      const data = await res.json();
      if (data.reward) {
        setReward(data.reward);
        if (data.reward.levelUp) {
          setLevelUpOpen(true);
        }
      }
      setCompleted((prev) => new Set(prev).add(ritualId));
    }
  }

  const daily = rituals.filter((ritual) => ritual.type === 'daily');
  const weekly = rituals.filter((ritual) => ritual.type === 'weekly');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Co-op mode</p>
            <p className="text-xs text-muted-foreground">
              Mark shared rituals to earn a connection bonus.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={shared}
              onChange={(event) => setShared(event.target.checked)}
            />
            Shared today
          </label>
        </div>
        {reward && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              +{reward.xpEarned} XP
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              +{reward.sparksEarned} Sparks
            </span>
            {reward.criticalSuccess && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                Critical Success!
              </span>
            )}
          </div>
        )}
      </div>
      {[{ title: 'Daily rituals', data: daily }, { title: 'Weekly rituals', data: weekly }].map(
        (section) => (
          <div key={section.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="mt-4 space-y-3">
              {section.data.map((ritual) => {
                const isDone = completed.has(ritual.id);
                return (
                  <button
                    key={ritual.id}
                    type="button"
                    onClick={() => handleLog(ritual.id)}
                    disabled={isDone || loadingId === ritual.id}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      isDone
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-border bg-card hover:border-border/70'
                    }`}
                  >
                    <span className={`mt-1 h-4 w-4 rounded-full border ${isDone ? 'border-green-500 bg-green-500' : 'border-border/70'}`} />
                    <span>
                      <span className="block font-medium">{ritual.title}</span>
                      <span className="block text-muted-foreground">{ritual.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
      {reward && (
        <LevelUpModal
          open={levelUpOpen}
          level={reward.level}
          title={reward.title}
          onClose={() => setLevelUpOpen(false)}
        />
      )}
    </div>
  );
}
