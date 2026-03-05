import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StockTransactionType } from '../../common/enums/stock-transaction-type.enum';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  branch_code: string;

  @IsString()
  @IsNotEmpty()
  item_code: string;

  @IsEnum(StockTransactionType)
  transaction_type: StockTransactionType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  created_by: string;
}
