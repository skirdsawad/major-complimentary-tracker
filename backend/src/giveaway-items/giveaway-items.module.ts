import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiveawayItemsController } from './giveaway-items.controller';
import { GiveawayItemsService } from './giveaway-items.service';
import { GiveawayItem } from './entities/giveaway-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GiveawayItem])],
  controllers: [GiveawayItemsController],
  providers: [GiveawayItemsService],
  exports: [GiveawayItemsService],
})
export class GiveawayItemsModule {}
