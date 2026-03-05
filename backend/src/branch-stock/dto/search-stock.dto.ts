import { IsOptional, IsString } from 'class-validator';

export class SearchStockDto {
  @IsString()
  @IsOptional()
  branch_code?: string;

  @IsString()
  @IsOptional()
  item_code?: string;
}
