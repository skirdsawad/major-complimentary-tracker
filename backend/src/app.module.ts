import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GiveawayItemsModule } from './giveaway-items/giveaway-items.module';

@Module({
  imports: [GiveawayItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
