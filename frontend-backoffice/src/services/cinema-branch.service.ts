import { CinemaBranch } from '@/types/cinema-branch';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/cinema-branches`;

export interface SearchParams {
  search?: string;
  isActive?: boolean;
}

export async function getCinemaBranches(
  params?: SearchParams,
): Promise<CinemaBranch[]> {
  const url = new URL(API_BASE);

  if (params?.search) {
    url.searchParams.set('search', params.search);
  }
  if (params?.isActive !== undefined) {
    url.searchParams.set('isActive', String(params.isActive));
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch cinema branches');
  }

  return res.json();
}

export async function getCinemaBranch(
  branchCode: string,
): Promise<CinemaBranch> {
  const res = await fetch(`${API_BASE}/${branchCode}`);

  if (!res.ok) {
    throw new Error('Failed to fetch cinema branch');
  }

  return res.json();
}

export async function createCinemaBranch(data: {
  branch_code: string;
  branch_name: string;
}): Promise<CinemaBranch> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create cinema branch');
  }

  return res.json();
}

export async function updateCinemaBranch(
  branchCode: string,
  data: { branch_name?: string },
): Promise<CinemaBranch> {
  const res = await fetch(`${API_BASE}/${branchCode}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update cinema branch');
  }

  return res.json();
}

export async function deactivateCinemaBranch(
  branchCode: string,
): Promise<CinemaBranch> {
  const res = await fetch(`${API_BASE}/${branchCode}/deactivate`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error('Failed to deactivate cinema branch');
  }

  return res.json();
}
