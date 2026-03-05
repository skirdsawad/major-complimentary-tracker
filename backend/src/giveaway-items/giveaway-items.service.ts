import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { GiveawayItem } from './interfaces/giveaway-item.interface';
import { CreateGiveawayItemDto } from './dto/create-giveaway-item.dto';
import { UpdateGiveawayItemDto } from './dto/update-giveaway-item.dto';
import { SearchGiveawayItemsDto } from './dto/search-giveaway-items.dto';

const STORAGE_FILE = 'giveaway-items.json';

@Injectable()
export class GiveawayItemsService {
  constructor(private readonly jsonStorageService: JsonStorageService) {}

  findAll(query: SearchGiveawayItemsDto): GiveawayItem[] {
    let items = this.jsonStorageService.read<GiveawayItem>(STORAGE_FILE);

    if (query.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.item_code.toLowerCase().includes(term) ||
          item.item_name.toLowerCase().includes(term),
      );
    }

    if (query.itemType) {
      items = items.filter((item) => item.item_type === query.itemType);
    }

    if (query.isActive !== undefined) {
      items = items.filter((item) => item.is_active === query.isActive);
    }

    return items;
  }

  findOne(itemCode: string): GiveawayItem {
    const items = this.jsonStorageService.read<GiveawayItem>(STORAGE_FILE);
    const item = items.find((i) => i.item_code === itemCode);

    if (!item) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    return item;
  }

  create(dto: CreateGiveawayItemDto): GiveawayItem {
    const items = this.jsonStorageService.read<GiveawayItem>(STORAGE_FILE);
    const existing = items.find((i) => i.item_code === dto.item_code);

    if (existing) {
      throw new ConflictException(
        `Giveaway item with code "${dto.item_code}" already exists`,
      );
    }

    const now = new Date().toISOString();
    const newItem: GiveawayItem = {
      item_code: dto.item_code,
      item_name: dto.item_name,
      item_type: dto.item_type,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    items.push(newItem);
    this.jsonStorageService.write(STORAGE_FILE, items);

    return newItem;
  }

  update(itemCode: string, dto: UpdateGiveawayItemDto): GiveawayItem {
    const items = this.jsonStorageService.read<GiveawayItem>(STORAGE_FILE);
    const index = items.findIndex((i) => i.item_code === itemCode);

    if (index === -1) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    const updated: GiveawayItem = {
      ...items[index],
      ...dto,
      updated_at: new Date().toISOString(),
    };

    items[index] = updated;
    this.jsonStorageService.write(STORAGE_FILE, items);

    return updated;
  }

  deactivate(itemCode: string): GiveawayItem {
    const items = this.jsonStorageService.read<GiveawayItem>(STORAGE_FILE);
    const index = items.findIndex((i) => i.item_code === itemCode);

    if (index === -1) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    items[index] = {
      ...items[index],
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    this.jsonStorageService.write(STORAGE_FILE, items);

    return items[index];
  }
}
