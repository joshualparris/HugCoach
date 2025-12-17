import { getOrCreateUser } from '@/lib/gamification';
import { storeItems } from '@/lib/store';
import StoreFront from '@/components/StoreFront';

export const dynamic = 'force-dynamic';

export default async function StorePage() {
  const user = await getOrCreateUser();
  const ownedThemes = JSON.parse(user.ownedThemes || '[]') as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Rewards Store</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Spend Sparks to unlock helpful bonuses and extras.
        </p>
      </div>
      <StoreFront
        items={storeItems}
        currency={user.currency}
        streakFreezes={user.streakFreezes}
        ownedThemes={ownedThemes}
        spicyDiceUnlocked={user.spicyDiceUnlocked}
      />
    </div>
  );
}
