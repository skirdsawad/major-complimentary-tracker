import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { CinemaBranch } from './interfaces/cinema-branch.interface';
import { CreateCinemaBranchDto } from './dto/create-cinema-branch.dto';
import { UpdateCinemaBranchDto } from './dto/update-cinema-branch.dto';
import { SearchCinemaBranchesDto } from './dto/search-cinema-branches.dto';

const STORAGE_FILE = 'cinema-branches.json';

@Injectable()
export class CinemaBranchesService {
  constructor(private readonly jsonStorageService: JsonStorageService) {}

  findAll(query: SearchCinemaBranchesDto): CinemaBranch[] {
    let branches =
      this.jsonStorageService.read<CinemaBranch>(STORAGE_FILE);

    if (query.search) {
      const term = query.search.toLowerCase();
      branches = branches.filter(
        (branch) =>
          branch.branch_code.toLowerCase().includes(term) ||
          branch.branch_name.toLowerCase().includes(term),
      );
    }

    if (query.isActive !== undefined) {
      branches = branches.filter(
        (branch) => branch.is_active === query.isActive,
      );
    }

    return branches;
  }

  findOne(branchCode: string): CinemaBranch {
    const branches =
      this.jsonStorageService.read<CinemaBranch>(STORAGE_FILE);
    const branch = branches.find((b) => b.branch_code === branchCode);

    if (!branch) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    return branch;
  }

  create(dto: CreateCinemaBranchDto): CinemaBranch {
    const branches =
      this.jsonStorageService.read<CinemaBranch>(STORAGE_FILE);
    const existing = branches.find(
      (b) => b.branch_code === dto.branch_code,
    );

    if (existing) {
      throw new ConflictException(
        `Cinema branch with code "${dto.branch_code}" already exists`,
      );
    }

    const now = new Date().toISOString();
    const newBranch: CinemaBranch = {
      branch_code: dto.branch_code,
      branch_name: dto.branch_name,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    branches.push(newBranch);
    this.jsonStorageService.write(STORAGE_FILE, branches);

    return newBranch;
  }

  update(branchCode: string, dto: UpdateCinemaBranchDto): CinemaBranch {
    const branches =
      this.jsonStorageService.read<CinemaBranch>(STORAGE_FILE);
    const index = branches.findIndex((b) => b.branch_code === branchCode);

    if (index === -1) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    const updated: CinemaBranch = {
      ...branches[index],
      ...dto,
      updated_at: new Date().toISOString(),
    };

    branches[index] = updated;
    this.jsonStorageService.write(STORAGE_FILE, branches);

    return updated;
  }

  deactivate(branchCode: string): CinemaBranch {
    const branches =
      this.jsonStorageService.read<CinemaBranch>(STORAGE_FILE);
    const index = branches.findIndex((b) => b.branch_code === branchCode);

    if (index === -1) {
      throw new NotFoundException(
        `Cinema branch with code "${branchCode}" not found`,
      );
    }

    branches[index] = {
      ...branches[index],
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    this.jsonStorageService.write(STORAGE_FILE, branches);

    return branches[index];
  }
}
