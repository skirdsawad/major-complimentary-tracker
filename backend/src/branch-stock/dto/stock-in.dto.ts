import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class StockInDto {
  @IsString()
  @IsNotEmpty()
  branch_code: string;

  @IsString()
  @IsNotEmpty()
  item_code: string;

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
