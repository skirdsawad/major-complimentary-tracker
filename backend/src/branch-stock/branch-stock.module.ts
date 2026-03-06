import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchStockController } from './branch-stock.controller';
import { BranchStockService } from './branch-stock.service';
import { BranchItemStock } from './entities/branch-item-stock.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { GiveawayItemsModule } from '../giveaway-items/giveaway-items.module';
import { CinemaBranchesModule } from '../cinema-branches/cinema-branches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchItemStock, StockTransaction]),
    GiveawayItemsModule,
    CinemaBranchesModule,
  ],
  controllers: [BranchStockController],
  providers: [BranchStockService],
  exports: [BranchStockService],
})
export class BranchStockModule {}
