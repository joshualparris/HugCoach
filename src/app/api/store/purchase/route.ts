import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/gamification';
import { storeItems } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId } = body ?? {};

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId.' }, { status: 400 });
    }

    const item = storeItems.find((entry) => entry.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    const user = await getOrCreateUser();
    if (user.currency < item.cost) {
      return NextResponse.json({ error: 'Not enough Sparks.' }, { status: 400 });
    }

    const ownedThemes = JSON.parse(user.ownedThemes || '[]') as string[];
    const nextThemes = item.reward.theme
      ? Array.from(new Set([...ownedThemes, item.reward.theme]))
      : ownedThemes;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        currency: user.currency - item.cost,
        streakFreezes: user.streakFreezes + (item.reward.streakFreezes ?? 0),
        spicyDiceUnlocked: user.spicyDiceUnlocked || Boolean(item.reward.spicyDiceUnlocked),
        ownedThemes: JSON.stringify(nextThemes)
      }
    });

    return NextResponse.json({
      ok: true,
      currency: updated.currency,
      streakFreezes: updated.streakFreezes,
      spicyDiceUnlocked: updated.spicyDiceUnlocked,
      ownedThemes: nextThemes
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to purchase item.' }, { status: 500 });
  }
}
