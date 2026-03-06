import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiveawayItemsService } from '../giveaway-items/giveaway-items.service';
import { CinemaBranchesService } from '../cinema-branches/cinema-branches.service';
import { BranchItemStock } from './entities/branch-item-stock.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { StockTransactionType } from '../common/enums/stock-transaction-type.enum';
import { StockInDto } from './dto/stock-in.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { SearchStockDto } from './dto/search-stock.dto';
import { SearchTransactionsDto } from './dto/search-transactions.dto';

@Injectable()
export class BranchStockService {
  constructor(
    @InjectRepository(BranchItemStock)
    private readonly stockRepository: Repository<BranchItemStock>,
    @InjectRepository(StockTransaction)
    private readonly transactionRepository: Repository<StockTransaction>,
    private readonly giveawayItemsService: GiveawayItemsService,
    private readonly cinemaBranchesService: CinemaBranchesService,
  ) {}

  async getStockBalances(query: SearchStockDto): Promise<BranchItemStock[]> {
    const where: any = {};

    if (query.branch_code) {
      where.branch_code = query.branch_code;
    }

    if (query.item_code) {
      where.item_code = query.item_code;
    }

    return await this.stockRepository.find({ where });
  }

  async getStockBalance(
    branchCode: string,
    itemCode: string,
  ): Promise<BranchItemStock> {
    const stock = await this.stockRepository.findOneBy({
      branch_code: branchCode,
      item_code: itemCode,
    });

    if (!stock) {
      throw new NotFoundException(
        `Stock balance for branch "${branchCode}" and item "${itemCode}" not found`,
      );
    }

    return stock;
  }

  async stockIn(dto: StockInDto): Promise<BranchItemStock> {
    await this.cinemaBranchesService.findOne(dto.branch_code);
    await this.giveawayItemsService.findOne(dto.item_code);

    let stock = await this.stockRepository.findOneBy({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
    });

    let previousBalance = 0;

    if (!stock) {
      stock = this.stockRepository.create({
        branch_code: dto.branch_code,
        item_code: dto.item_code,
        quantity: dto.quantity,
      });
    } else {
      previousBalance = stock.quantity;
      stock.quantity += dto.quantity;
    }

    stock = await this.stockRepository.save(stock);

    const newBalance = previousBalance + dto.quantity;
    await this.logTransaction({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
      transaction_type: StockTransactionType.STOCK_IN,
      quantity: dto.quantity,
      previous_balance: previousBalance,
      new_balance: newBalance,
      reason: dto.reason ?? null,
      created_by: dto.created_by,
    });

    return stock;
  }

  async adjustStock(dto: AdjustStockDto): Promise<BranchItemStock> {
    if (
      dto.transaction_type !== StockTransactionType.ADJUSTMENT_PLUS &&
      dto.transaction_type !== StockTransactionType.ADJUSTMENT_MINUS
    ) {
      throw new BadRequestException(
        'Transaction type must be ADJUSTMENT_PLUS or ADJUSTMENT_MINUS',
      );
    }

    await this.cinemaBranchesService.findOne(dto.branch_code);
    await this.giveawayItemsService.findOne(dto.item_code);

    let stock = await this.stockRepository.findOneBy({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
    });

    let previousBalance = 0;

    if (dto.transaction_type === StockTransactionType.ADJUSTMENT_MINUS) {
      if (!stock) {
        throw new BadRequestException(
          'Cannot adjust minus: no stock balance exists',
        );
      }
      previousBalance = stock.quantity;
      if (previousBalance < dto.quantity) {
        throw new BadRequestException(
          `Insufficient balance. Current: ${previousBalance}, requested: ${dto.quantity}`,
        );
      }
      stock.quantity -= dto.quantity;
    } else {
      if (!stock) {
        stock = this.stockRepository.create({
          branch_code: dto.branch_code,
          item_code: dto.item_code,
          quantity: dto.quantity,
        });
      } else {
        previousBalance = stock.quantity;
        stock.quantity += dto.quantity;
      }
    }

    stock = await this.stockRepository.save(stock);

    const newBalance =
      dto.transaction_type === StockTransactionType.ADJUSTMENT_PLUS
        ? previousBalance + dto.quantity
        : previousBalance - dto.quantity;

    await this.logTransaction({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
      transaction_type: dto.transaction_type,
      quantity: dto.quantity,
      previous_balance: previousBalance,
      new_balance: newBalance,
      reason: dto.reason ?? null,
      created_by: dto.created_by,
    });

    return stock;
  }

  async getTransactions(
    query: SearchTransactionsDto,
  ): Promise<StockTransaction[]> {
    const where: any = {};

    if (query.branch_code) {
      where.branch_code = query.branch_code;
    }

    if (query.item_code) {
      where.item_code = query.item_code;
    }

    if (query.transaction_type) {
      where.transaction_type = query.transaction_type;
    }

    return await this.transactionRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async issueGiveaway(
    branchCode: string,
    itemCode: string,
    quantity: number,
    createdBy: string,
    reference: string,
  ): Promise<BranchItemStock> {
    const item = await this.giveawayItemsService.findOne(itemCode);

    const duplicate = await this.transactionRepository.findOneBy({
      transaction_type: StockTransactionType.ISSUE_GIVEAWAY,
      reason: reference,
      item_code: itemCode,
    });

    if (duplicate) {
      throw new BadRequestException(
        `Ticket "${reference}" has already received item "${item.item_name}"`,
      );
    }

    const stock = await this.stockRepository.findOneBy({
      branch_code: branchCode,
      item_code: itemCode,
    });

    if (!stock) {
      throw new BadRequestException(
        'Cannot issue giveaway: no stock balance exists',
      );
    }

    const previousBalance = stock.quantity;
    if (previousBalance < quantity) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${previousBalance}, requested: ${quantity}`,
      );
    }

    stock.quantity -= quantity;
    const updatedStock = await this.stockRepository.save(stock);

    await this.logTransaction({
      branch_code: branchCode,
      item_code: itemCode,
      transaction_type: StockTransactionType.ISSUE_GIVEAWAY,
      quantity,
      previous_balance: previousBalance,
      new_balance: previousBalance - quantity,
      reason: reference,
      created_by: createdBy,
    });

    return updatedStock;
  }

  private async logTransaction(
    data: Omit<StockTransaction, 'id' | 'created_at'>,
  ): Promise<void> {
    const transaction = this.transactionRepository.create(data);
    await this.transactionRepository.save(transaction);
  }
}
