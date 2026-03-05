import { CinemaBranch } from '@/types/cinema-branch';

const API_BASE = 'http://localhost:5000/api/cinema-branches';

export async function getActiveCinemaBranches(): Promise<CinemaBranch[]> {
  const url = new URL(API_BASE);
  url.searchParams.set('isActive', 'true');

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch cinema branches');
  }

  return res.json();
}
