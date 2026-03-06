import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaBranchesController } from './cinema-branches.controller';
import { CinemaBranchesService } from './cinema-branches.service';
import { CinemaBranch } from './entities/cinema-branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CinemaBranch])],
  controllers: [CinemaBranchesController],
  providers: [CinemaBranchesService],
  exports: [CinemaBranchesService],
})
export class CinemaBranchesModule {}
