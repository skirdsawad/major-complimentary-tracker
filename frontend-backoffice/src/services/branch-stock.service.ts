import {
  BranchItemStock,
  StockTransaction,
  StockTransactionType,
} from '@/types/branch-stock';

const API_BASE = 'http://localhost:5000/api/branch-stock';

export interface SearchStockParams {
  branch_code?: string;
  item_code?: string;
}

export interface SearchTransactionsParams {
  branch_code?: string;
  item_code?: string;
  transaction_type?: StockTransactionType;
}

export interface StockInData {
  branch_code: string;
  item_code: string;
  quantity: number;
  reason?: string;
  created_by: string;
}

export interface AdjustStockData {
  branch_code: string;
  item_code: string;
  transaction_type: StockTransactionType;
  quantity: number;
  reason?: string;
  created_by: string;
}

export async function getStockBalances(
  params?: SearchStockParams,
): Promise<BranchItemStock[]> {
  const url = new URL(`${API_BASE}/balances`);

  if (params?.branch_code) {
    url.searchParams.set('branch_code', params.branch_code);
  }
  if (params?.item_code) {
    url.searchParams.set('item_code', params.item_code);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch stock balances');
  }

  return res.json();
}

export async function stockIn(data: StockInData): Promise<BranchItemStock> {
  const res = await fetch(`${API_BASE}/stock-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to stock in');
  }

  return res.json();
}

export async function adjustStock(
  data: AdjustStockData,
): Promise<BranchItemStock> {
  const res = await fetch(`${API_BASE}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to adjust stock');
  }

  return res.json();
}

export async function getTransactions(
  params?: SearchTransactionsParams,
): Promise<StockTransaction[]> {
  const url = new URL(`${API_BASE}/transactions`);

  if (params?.branch_code) {
    url.searchParams.set('branch_code', params.branch_code);
  }
  if (params?.item_code) {
    url.searchParams.set('item_code', params.item_code);
  }
  if (params?.transaction_type) {
    url.searchParams.set('transaction_type', params.transaction_type);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return res.json();
}
