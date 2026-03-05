import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class IssueGiveawayDto {
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
  @IsNotEmpty()
  created_by: string;

  @IsString()
  @IsNotEmpty()
  reference: string;
}
