import { BranchItemStock } from '@/types/branch-stock';

const API_BASE = 'http://localhost:5000/api/branch-stock';

export async function getBranchStockBalances(
  branchCode: string,
): Promise<BranchItemStock[]> {
  const url = new URL(`${API_BASE}/balances`);
  url.searchParams.set('branch_code', branchCode);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch stock balances');
  }

  return res.json();
}

export interface IssueGiveawayData {
  branch_code: string;
  item_code: string;
  quantity: number;
  created_by: string;
  reference: string;
}

export async function issueGiveaway(
  data: IssueGiveawayData,
): Promise<BranchItemStock> {
  const res = await fetch(`${API_BASE}/issue-giveaway`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to issue giveaway');
  }

  return res.json();
}
