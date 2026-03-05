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
import { CreateCinemaBranchDto } from './dto/create-cinema-branch.dto';
import { UpdateCinemaBranchDto } from './dto/update-cinema-branch.dto';
import { SearchCinemaBranchesDto } from './dto/search-cinema-branches.dto';

@Controller('api/cinema-branches')
export class CinemaBranchesController {
  constructor(
    private readonly cinemaBranchesService: CinemaBranchesService,
  ) {}

  @Get()
  findAll(@Query() query: SearchCinemaBranchesDto) {
    return this.cinemaBranchesService.findAll(query);
  }

  @Get(':branchCode')
  findOne(@Param('branchCode') branchCode: string) {
    return this.cinemaBranchesService.findOne(branchCode);
  }

  @Post()
  create(@Body() dto: CreateCinemaBranchDto) {
    return this.cinemaBranchesService.create(dto);
  }

  @Patch(':branchCode')
  update(
    @Param('branchCode') branchCode: string,
    @Body() dto: UpdateCinemaBranchDto,
  ) {
    return this.cinemaBranchesService.update(branchCode, dto);
  }

  @Patch(':branchCode/deactivate')
  deactivate(@Param('branchCode') branchCode: string) {
    return this.cinemaBranchesService.deactivate(branchCode);
  }
}
