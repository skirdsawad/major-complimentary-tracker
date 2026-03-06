import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GiveawayItemsService } from './giveaway-items.service';
import { GiveawayItem } from './entities/giveaway-item.entity';
import { CreateGiveawayItemDto } from './dto/create-giveaway-item.dto';
import { UpdateGiveawayItemDto } from './dto/update-giveaway-item.dto';
import { SearchGiveawayItemsDto } from './dto/search-giveaway-items.dto';

@Controller('api/giveaway-items')
export class GiveawayItemsController {
  constructor(private readonly giveawayItemsService: GiveawayItemsService) {}

  @Get()
  async findAll(
    @Query() query: SearchGiveawayItemsDto,
  ): Promise<GiveawayItem[]> {
    return await this.giveawayItemsService.findAll(query);
  }

  @Get(':itemCode')
  async findOne(
    @Param('itemCode') itemCode: string,
  ): Promise<GiveawayItem> {
    return await this.giveawayItemsService.findOne(itemCode);
  }

  @Post()
  async create(
    @Body() dto: CreateGiveawayItemDto,
  ): Promise<GiveawayItem> {
    return await this.giveawayItemsService.create(dto);
  }

  @Patch(':itemCode')
  async update(
    @Param('itemCode') itemCode: string,
    @Body() dto: UpdateGiveawayItemDto,
  ): Promise<GiveawayItem> {
    return await this.giveawayItemsService.update(itemCode, dto);
  }

  @Patch(':itemCode/deactivate')
  async deactivate(
    @Param('itemCode') itemCode: string,
  ): Promise<GiveawayItem> {
    return await this.giveawayItemsService.deactivate(itemCode);
  }
}
