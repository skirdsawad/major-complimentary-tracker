import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { GiveawayItem } from './entities/giveaway-item.entity';
import { CreateGiveawayItemDto } from './dto/create-giveaway-item.dto';
import { UpdateGiveawayItemDto } from './dto/update-giveaway-item.dto';
import { SearchGiveawayItemsDto } from './dto/search-giveaway-items.dto';

@Injectable()
export class GiveawayItemsService {
  constructor(
    @InjectRepository(GiveawayItem)
    private readonly giveawayItemRepository: Repository<GiveawayItem>,
  ) {}

  async findAll(query: SearchGiveawayItemsDto): Promise<GiveawayItem[]> {
    const where: any[] = [];

    if (query.search) {
      const term = `%${query.search}%`;
      const baseWhere: any = {};

      if (query.itemType) {
        baseWhere.item_type = query.itemType;
      }

      if (query.isActive !== undefined) {
        baseWhere.is_active = query.isActive;
      }

      where.push(
        { ...baseWhere, item_code: ILike(term) },
        { ...baseWhere, item_name: ILike(term) },
      );
    } else {
      const baseWhere: any = {};

      if (query.itemType) {
        baseWhere.item_type = query.itemType;
      }

      if (query.isActive !== undefined) {
        baseWhere.is_active = query.isActive;
      }

      where.push(baseWhere);
    }

    return await this.giveawayItemRepository.find({ where });
  }

  async findOne(itemCode: string): Promise<GiveawayItem> {
    const item = await this.giveawayItemRepository.findOneBy({
      item_code: itemCode,
    });

    if (!item) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    return item;
  }

  async create(dto: CreateGiveawayItemDto): Promise<GiveawayItem> {
    const existing = await this.giveawayItemRepository.findOneBy({
      item_code: dto.item_code,
    });

    if (existing) {
      throw new ConflictException(
        `Giveaway item with code "${dto.item_code}" already exists`,
      );
    }

    const newItem = this.giveawayItemRepository.create({
      item_code: dto.item_code,
      item_name: dto.item_name,
      item_type: dto.item_type,
      is_active: true,
    });

    return await this.giveawayItemRepository.save(newItem);
  }

  async update(
    itemCode: string,
    dto: UpdateGiveawayItemDto,
  ): Promise<GiveawayItem> {
    const item = await this.giveawayItemRepository.findOneBy({
      item_code: itemCode,
    });

    if (!item) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    Object.assign(item, dto);

    return await this.giveawayItemRepository.save(item);
  }

  async deactivate(itemCode: string): Promise<GiveawayItem> {
    const item = await this.giveawayItemRepository.findOneBy({
      item_code: itemCode,
    });

    if (!item) {
      throw new NotFoundException(
        `Giveaway item with code "${itemCode}" not found`,
      );
    }

    item.is_active = false;

    return await this.giveawayItemRepository.save(item);
  }
}
