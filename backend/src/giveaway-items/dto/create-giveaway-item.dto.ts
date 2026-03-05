import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ItemType } from '../../common/enums/item-type.enum';

export class CreateGiveawayItemDto {
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsEnum(ItemType)
  item_type: ItemType;
}
