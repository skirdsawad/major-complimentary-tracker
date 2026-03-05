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
import { CreateGiveawayItemDto } from './dto/create-giveaway-item.dto';
import { UpdateGiveawayItemDto } from './dto/update-giveaway-item.dto';
import { SearchGiveawayItemsDto } from './dto/search-giveaway-items.dto';

@Controller('api/giveaway-items')
export class GiveawayItemsController {
  constructor(private readonly giveawayItemsService: GiveawayItemsService) {}

  @Get()
  findAll(@Query() query: SearchGiveawayItemsDto) {
    return this.giveawayItemsService.findAll(query);
  }

  @Get(':itemCode')
  findOne(@Param('itemCode') itemCode: string) {
    return this.giveawayItemsService.findOne(itemCode);
  }

  @Post()
  create(@Body() dto: CreateGiveawayItemDto) {
    return this.giveawayItemsService.create(dto);
  }

  @Patch(':itemCode')
  update(
    @Param('itemCode') itemCode: string,
    @Body() dto: UpdateGiveawayItemDto,
  ) {
    return this.giveawayItemsService.update(itemCode, dto);
  }

  @Patch(':itemCode/deactivate')
  deactivate(@Param('itemCode') itemCode: string) {
    return this.giveawayItemsService.deactivate(itemCode);
  }
}
