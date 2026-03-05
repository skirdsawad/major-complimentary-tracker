import { Module } from '@nestjs/common';
import { BranchStockController } from './branch-stock.controller';
import { BranchStockService } from './branch-stock.service';
import { JsonStorageService } from '../common/services/json-storage.service';
import { GiveawayItemsService } from '../giveaway-items/giveaway-items.service';
import { CinemaBranchesService } from '../cinema-branches/cinema-branches.service';

@Module({
  controllers: [BranchStockController],
  providers: [
    BranchStockService,
    JsonStorageService,
    GiveawayItemsService,
    CinemaBranchesService,
  ],
  exports: [BranchStockService],
})
export class BranchStockModule {}
