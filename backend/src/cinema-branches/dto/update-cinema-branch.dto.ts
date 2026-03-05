import { IsOptional, IsString } from 'class-validator';

export class UpdateCinemaBranchDto {
  @IsString()
  @IsOptional()
  branch_name?: string;
}
