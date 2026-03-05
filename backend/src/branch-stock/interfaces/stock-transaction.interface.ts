import { StockTransactionType } from '../../common/enums/stock-transaction-type.enum';

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
