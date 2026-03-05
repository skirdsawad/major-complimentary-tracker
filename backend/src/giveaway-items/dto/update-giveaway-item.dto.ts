import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ItemType } from '../../common/enums/item-type.enum';

export class UpdateGiveawayItemDto {
  @IsString()
  @IsOptional()
  item_name?: string;

  @IsEnum(ItemType)
  @IsOptional()
  item_type?: ItemType;
}
