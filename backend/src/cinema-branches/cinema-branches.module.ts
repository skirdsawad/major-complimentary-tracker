import { Module } from '@nestjs/common';
import { CinemaBranchesController } from './cinema-branches.controller';
import { CinemaBranchesService } from './cinema-branches.service';
import { JsonStorageService } from '../common/services/json-storage.service';

@Module({
  controllers: [CinemaBranchesController],
  providers: [CinemaBranchesService, JsonStorageService],
})
export class CinemaBranchesModule {}
