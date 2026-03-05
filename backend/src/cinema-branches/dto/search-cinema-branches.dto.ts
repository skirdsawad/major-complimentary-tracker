import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchCinemaBranchesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }

    return value;
  })
  isActive?: boolean;
}
