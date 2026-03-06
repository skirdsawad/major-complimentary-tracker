import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GiveawayItemsModule } from './giveaway-items/giveaway-items.module';
import { CinemaBranchesModule } from './cinema-branches/cinema-branches.module';
import { BranchStockModule } from './branch-stock/branch-stock.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GiveawayItemsModule,
    CinemaBranchesModule,
    BranchStockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
