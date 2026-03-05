import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StockTransactionType } from '../../common/enums/stock-transaction-type.enum';

export class SearchTransactionsDto {
  @IsString()
  @IsOptional()
  branch_code?: string;

  @IsString()
  @IsOptional()
  item_code?: string;

  @IsEnum(StockTransactionType)
  @IsOptional()
  transaction_type?: StockTransactionType;
}
