import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { GiveawayItemsService } from '../giveaway-items/giveaway-items.service';
import { CinemaBranchesService } from '../cinema-branches/cinema-branches.service';
import { BranchItemStock } from './interfaces/branch-item-stock.interface';
import { StockTransaction } from './interfaces/stock-transaction.interface';
import { StockTransactionType } from '../common/enums/stock-transaction-type.enum';
import { StockInDto } from './dto/stock-in.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { SearchStockDto } from './dto/search-stock.dto';
import { SearchTransactionsDto } from './dto/search-transactions.dto';

const STOCK_FILE = 'branch-item-stocks.json';
const TRANSACTIONS_FILE = 'stock-transactions.json';

@Injectable()
export class BranchStockService {
  constructor(
    private readonly jsonStorageService: JsonStorageService,
    private readonly giveawayItemsService: GiveawayItemsService,
    private readonly cinemaBranchesService: CinemaBranchesService,
  ) {}

  getStockBalances(query: SearchStockDto): BranchItemStock[] {
    let stocks =
      this.jsonStorageService.read<BranchItemStock>(STOCK_FILE);

    if (query.branch_code) {
      stocks = stocks.filter((s) => s.branch_code === query.branch_code);
    }

    if (query.item_code) {
      stocks = stocks.filter((s) => s.item_code === query.item_code);
    }

    return stocks;
  }

  getStockBalance(branchCode: string, itemCode: string): BranchItemStock {
    const stocks =
      this.jsonStorageService.read<BranchItemStock>(STOCK_FILE);
    const stock = stocks.find(
      (s) => s.branch_code === branchCode && s.item_code === itemCode,
    );

    if (!stock) {
      throw new NotFoundException(
        `Stock balance for branch "${branchCode}" and item "${itemCode}" not found`,
      );
    }

    return stock;
  }

  stockIn(dto: StockInDto): BranchItemStock {
    this.cinemaBranchesService.findOne(dto.branch_code);
    this.giveawayItemsService.findOne(dto.item_code);

    const stocks =
      this.jsonStorageService.read<BranchItemStock>(STOCK_FILE);
    const index = stocks.findIndex(
      (s) => s.branch_code === dto.branch_code && s.item_code === dto.item_code,
    );

    const now = new Date().toISOString();
    let previousBalance = 0;

    if (index === -1) {
      const newStock: BranchItemStock = {
        id: crypto.randomUUID(),
        branch_code: dto.branch_code,
        item_code: dto.item_code,
        quantity: dto.quantity,
        updated_at: now,
      };
      stocks.push(newStock);
    } else {
      previousBalance = stocks[index].quantity;
      stocks[index] = {
        ...stocks[index],
        quantity: stocks[index].quantity + dto.quantity,
        updated_at: now,
      };
    }

    this.jsonStorageService.write(STOCK_FILE, stocks);

    const newBalance = previousBalance + dto.quantity;
    this.logTransaction({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
      transaction_type: StockTransactionType.STOCK_IN,
      quantity: dto.quantity,
      previous_balance: previousBalance,
      new_balance: newBalance,
      reason: dto.reason,
      created_by: dto.created_by,
    });

    return index === -1 ? stocks[stocks.length - 1] : stocks[index];
  }

  adjustStock(dto: AdjustStockDto): BranchItemStock {
    if (
      dto.transaction_type !== StockTransactionType.ADJUSTMENT_PLUS &&
      dto.transaction_type !== StockTransactionType.ADJUSTMENT_MINUS
    ) {
      throw new BadRequestException(
        'Transaction type must be ADJUSTMENT_PLUS or ADJUSTMENT_MINUS',
      );
    }

    this.cinemaBranchesService.findOne(dto.branch_code);
    this.giveawayItemsService.findOne(dto.item_code);

    const stocks =
      this.jsonStorageService.read<BranchItemStock>(STOCK_FILE);
    const index = stocks.findIndex(
      (s) => s.branch_code === dto.branch_code && s.item_code === dto.item_code,
    );

    const now = new Date().toISOString();
    let previousBalance = 0;

    if (dto.transaction_type === StockTransactionType.ADJUSTMENT_MINUS) {
      if (index === -1) {
        throw new BadRequestException(
          'Cannot adjust minus: no stock balance exists',
        );
      }
      previousBalance = stocks[index].quantity;
      if (previousBalance < dto.quantity) {
        throw new BadRequestException(
          `Insufficient balance. Current: ${previousBalance}, requested: ${dto.quantity}`,
        );
      }
      stocks[index] = {
        ...stocks[index],
        quantity: stocks[index].quantity - dto.quantity,
        updated_at: now,
      };
    } else {
      if (index === -1) {
        const newStock: BranchItemStock = {
          id: crypto.randomUUID(),
          branch_code: dto.branch_code,
          item_code: dto.item_code,
          quantity: dto.quantity,
          updated_at: now,
        };
        stocks.push(newStock);
      } else {
        previousBalance = stocks[index].quantity;
        stocks[index] = {
          ...stocks[index],
          quantity: stocks[index].quantity + dto.quantity,
          updated_at: now,
        };
      }
    }

    this.jsonStorageService.write(STOCK_FILE, stocks);

    const newBalance =
      dto.transaction_type === StockTransactionType.ADJUSTMENT_PLUS
        ? previousBalance + dto.quantity
        : previousBalance - dto.quantity;

    this.logTransaction({
      branch_code: dto.branch_code,
      item_code: dto.item_code,
      transaction_type: dto.transaction_type,
      quantity: dto.quantity,
      previous_balance: previousBalance,
      new_balance: newBalance,
      reason: dto.reason,
      created_by: dto.created_by,
    });

    return index === -1 ? stocks[stocks.length - 1] : stocks[index];
  }

  getTransactions(query: SearchTransactionsDto): StockTransaction[] {
    let transactions =
      this.jsonStorageService.read<StockTransaction>(TRANSACTIONS_FILE);

    if (query.branch_code) {
      transactions = transactions.filter(
        (t) => t.branch_code === query.branch_code,
      );
    }

    if (query.item_code) {
      transactions = transactions.filter(
        (t) => t.item_code === query.item_code,
      );
    }

    if (query.transaction_type) {
      transactions = transactions.filter(
        (t) => t.transaction_type === query.transaction_type,
      );
    }

    return transactions.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  issueGiveaway(
    branchCode: string,
    itemCode: string,
    quantity: number,
    createdBy: string,
    reference: string,
  ): BranchItemStock {
    const item = this.giveawayItemsService.findOne(itemCode);

    const transactions =
      this.jsonStorageService.read<StockTransaction>(TRANSACTIONS_FILE);
    const duplicate = transactions.find(
      (t) =>
        t.transaction_type === StockTransactionType.ISSUE_GIVEAWAY &&
        t.reason === reference &&
        t.item_code === itemCode,
    );

    if (duplicate) {
      throw new BadRequestException(
        `Ticket "${reference}" has already received item "${item.item_name}"`,
      );
    }

    const stocks =
      this.jsonStorageService.read<BranchItemStock>(STOCK_FILE);
    const index = stocks.findIndex(
      (s) => s.branch_code === branchCode && s.item_code === itemCode,
    );

    if (index === -1) {
      throw new BadRequestException(
        'Cannot issue giveaway: no stock balance exists',
      );
    }

    const previousBalance = stocks[index].quantity;
    if (previousBalance < quantity) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${previousBalance}, requested: ${quantity}`,
      );
    }

    const now = new Date().toISOString();
    stocks[index] = {
      ...stocks[index],
      quantity: stocks[index].quantity - quantity,
      updated_at: now,
    };

    this.jsonStorageService.write(STOCK_FILE, stocks);

    this.logTransaction({
      branch_code: branchCode,
      item_code: itemCode,
      transaction_type: StockTransactionType.ISSUE_GIVEAWAY,
      quantity,
      previous_balance: previousBalance,
      new_balance: previousBalance - quantity,
      reason: reference,
      created_by: createdBy,
    });

    return stocks[index];
  }

  private logTransaction(data: Omit<StockTransaction, 'id' | 'created_at'>): void {
    const transactions =
      this.jsonStorageService.read<StockTransaction>(TRANSACTIONS_FILE);

    const transaction: StockTransaction = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };

    transactions.push(transaction);
    this.jsonStorageService.write(TRANSACTIONS_FILE, transactions);
  }
}
