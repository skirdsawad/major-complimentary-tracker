import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ItemType } from '../../common/enums/item-type.enum';
import { Transform } from 'class-transformer';

export class SearchGiveawayItemsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ItemType)
  @IsOptional()
  itemType?: ItemType;

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
