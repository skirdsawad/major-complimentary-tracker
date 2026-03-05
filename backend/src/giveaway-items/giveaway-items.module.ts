import { Module } from '@nestjs/common';
import { GiveawayItemsController } from './giveaway-items.controller';
import { GiveawayItemsService } from './giveaway-items.service';
import { JsonStorageService } from '../common/services/json-storage.service';

@Module({
  controllers: [GiveawayItemsController],
  providers: [GiveawayItemsService, JsonStorageService],
})
export class GiveawayItemsModule {}
