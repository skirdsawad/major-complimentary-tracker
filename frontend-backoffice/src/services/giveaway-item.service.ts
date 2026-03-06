import { GiveawayItem, ItemType } from '@/types/giveaway-item';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/giveaway-items`;

export interface SearchParams {
  search?: string;
  itemType?: ItemType;
  isActive?: boolean;
}

export async function getGiveawayItems(
  params?: SearchParams,
): Promise<GiveawayItem[]> {
  const url = new URL(API_BASE);

  if (params?.search) {
    url.searchParams.set('search', params.search);
  }
  if (params?.itemType) {
    url.searchParams.set('itemType', params.itemType);
  }
  if (params?.isActive !== undefined) {
    url.searchParams.set('isActive', String(params.isActive));
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch giveaway items');
  }

  return res.json();
}

export async function getGiveawayItem(
  itemCode: string,
): Promise<GiveawayItem> {
  const res = await fetch(`${API_BASE}/${itemCode}`);

  if (!res.ok) {
    throw new Error('Failed to fetch giveaway item');
  }

  return res.json();
}

export async function createGiveawayItem(data: {
  item_code: string;
  item_name: string;
  item_type: ItemType;
}): Promise<GiveawayItem> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create giveaway item');
  }

  return res.json();
}

export async function updateGiveawayItem(
  itemCode: string,
  data: { item_name?: string; item_type?: ItemType },
): Promise<GiveawayItem> {
  const res = await fetch(`${API_BASE}/${itemCode}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update giveaway item');
  }

  return res.json();
}

export async function deactivateGiveawayItem(
  itemCode: string,
): Promise<GiveawayItem> {
  const res = await fetch(`${API_BASE}/${itemCode}/deactivate`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error('Failed to deactivate giveaway item');
  }

  return res.json();
}
