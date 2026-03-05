export enum StockTransactionType {
  OPENING_BALANCE = 'OPENING_BALANCE',
  STOCK_IN = 'STOCK_IN',
  ADJUSTMENT_PLUS = 'ADJUSTMENT_PLUS',
  ADJUSTMENT_MINUS = 'ADJUSTMENT_MINUS',
  ISSUE_GIVEAWAY = 'ISSUE_GIVEAWAY',
}

export interface BranchItemStock {
  id: string;
  branch_code: string;
  item_code: string;
  quantity: number;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  branch_code: string;
  item_code: string;
  transaction_type: StockTransactionType;
  quantity: number;
  previous_balance: number;
  new_balance: number;
  reason?: string;
  created_by: string;
  created_at: string;
}
