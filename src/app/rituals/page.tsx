import { prisma } from '@/lib/prisma';
import { todayString } from '@/lib/date';
import RitualChecklist from '@/components/RitualChecklist';

export const dynamic = 'force-dynamic';

export default async function RitualsPage() {
  const today = todayString();
  const [rituals, logs] = await Promise.all([
    prisma.ritual.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] }),
    prisma.ritualLog.findMany({ where: { date: today } })
  ]);

  const ritualItems = rituals.map((ritual) => ({
    id: ritual.id,
    title: ritual.title,
    description: ritual.description,
    type: ritual.type as 'daily' | 'weekly'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Rituals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track the small practices that keep connection steady.
        </p>
      </div>

      <RitualChecklist rituals={ritualItems} completedIds={logs.map((log) => log.ritualId)} />
    </div>
  );
}
