import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CinemaBranchesService } from './cinema-branches.service';
import { CinemaBranch } from './entities/cinema-branch.entity';
import { CreateCinemaBranchDto } from './dto/create-cinema-branch.dto';
import { UpdateCinemaBranchDto } from './dto/update-cinema-branch.dto';
import { SearchCinemaBranchesDto } from './dto/search-cinema-branches.dto';

@Controller('api/cinema-branches')
export class CinemaBranchesController {
  constructor(
    private readonly cinemaBranchesService: CinemaBranchesService,
  ) {}

  @Get()
  async findAll(
    @Query() query: SearchCinemaBranchesDto,
  ): Promise<CinemaBranch[]> {
    return await this.cinemaBranchesService.findAll(query);
  }

  @Get(':branchCode')
  async findOne(
    @Param('branchCode') branchCode: string,
  ): Promise<CinemaBranch> {
    return await this.cinemaBranchesService.findOne(branchCode);
  }

  @Post()
  async create(
    @Body() dto: CreateCinemaBranchDto,
  ): Promise<CinemaBranch> {
    return await this.cinemaBranchesService.create(dto);
  }

  @Patch(':branchCode')
  async update(
    @Param('branchCode') branchCode: string,
    @Body() dto: UpdateCinemaBranchDto,
  ): Promise<CinemaBranch> {
    return await this.cinemaBranchesService.update(branchCode, dto);
  }

  @Patch(':branchCode/deactivate')
  async deactivate(
    @Param('branchCode') branchCode: string,
  ): Promise<CinemaBranch> {
    return await this.cinemaBranchesService.deactivate(branchCode);
  }
}
