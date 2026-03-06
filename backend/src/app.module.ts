import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GiveawayItemsModule } from './giveaway-items/giveaway-items.module';
import { CinemaBranchesModule } from './cinema-branches/cinema-branches.module';
import { BranchStockModule } from './branch-stock/branch-stock.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>(
          'DB_DATABASE',
          'complimentary_tracker',
        ),
        ssl: configService.get<string>('DB_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    GiveawayItemsModule,
    CinemaBranchesModule,
    BranchStockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
