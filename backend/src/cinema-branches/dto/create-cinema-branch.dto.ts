import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCinemaBranchDto {
  @IsString()
  @IsNotEmpty()
  branch_code: string;

  @IsString()
  @IsNotEmpty()
  branch_name: string;
}
