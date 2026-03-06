import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CinemaBranch } from './entities/cinema-branch.entity';
import { CreateCinemaBranchDto } from './dto/create-cinema-branch.dto';
import { UpdateCinemaBranchDto } from './dto/update-cinema-branch.dto';
import { SearchCinemaBranchesDto } from './dto/search-cinema-branches.dto';

@Injectable()
export class CinemaBranchesService {
  constructor(
    @InjectRepository(CinemaBranch)
    private readonly cinemaBranchRepository: Repository<CinemaBranch>,
  ) {}

  async findAll(query: SearchCinemaBranchesDto): Promise<CinemaBranch[]> {
    const where: any[] = [];

    if (query.search) {
      const term = `%${query.search}%`;
      const baseWhere: any = {};

      if (query.isActive !== undefined) {
        baseWhere.is_active = query.isActive;
      }

      where.push(
        { ...baseWhere, branch_code: ILike(term) },
        { ...baseWhere, branch_name: ILike(term) },
      );
    } else {
      const baseWhere: any = {};

      if (query.isActive !== undefined) {
        baseWhere.is_active = query.isActive;
      }

      where.push(baseWhere);
    }

    return await this.cinemaBranchRepository.find({ where });
  }

  async findOne(branchCode: string): Promise<CinemaBranch> {
    const branch = await this.cinemaBranchRepository.findOneBy({
      branch_code: branchCode,
    });

    if (!branch) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    return branch;
  }

  async create(dto: CreateCinemaBranchDto): Promise<CinemaBranch> {
    const existing = await this.cinemaBranchRepository.findOneBy({
      branch_code: dto.branch_code,
    });

    if (existing) {
      throw new ConflictException(
        `Cinema branch with code "${dto.branch_code}" already exists`,
      );
    }

    const newBranch = this.cinemaBranchRepository.create({
      branch_code: dto.branch_code,
      branch_name: dto.branch_name,
      is_active: true,
    });

    return await this.cinemaBranchRepository.save(newBranch);
  }

  async update(
    branchCode: string,
    dto: UpdateCinemaBranchDto,
  ): Promise<CinemaBranch> {
    const branch = await this.cinemaBranchRepository.findOneBy({
      branch_code: branchCode,
    });

    if (!branch) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    Object.assign(branch, dto);

    return await this.cinemaBranchRepository.save(branch);
  }

  async deactivate(branchCode: string): Promise<CinemaBranch> {
    const branch = await this.cinemaBranchRepository.findOneBy({
      branch_code: branchCode,
    });

    if (!branch) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    branch.is_active = false;

    return await this.cinemaBranchRepository.save(branch);
  }
}
