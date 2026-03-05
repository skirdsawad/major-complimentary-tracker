import { GiveawayItem } from '@/types/giveaway-item';

const API_BASE = 'http://localhost:5000/api/giveaway-items';

export async function getActiveGiveawayItems(): Promise<GiveawayItem[]> {
  const url = new URL(API_BASE);
  url.searchParams.set('isActive', 'true');

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch giveaway items');
  }

  return res.json();
}
