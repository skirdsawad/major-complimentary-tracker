import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BranchStockService } from './branch-stock.service';
import { BranchItemStock } from './entities/branch-item-stock.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { StockInDto } from './dto/stock-in.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { IssueGiveawayDto } from './dto/issue-giveaway.dto';
import { SearchStockDto } from './dto/search-stock.dto';
import { SearchTransactionsDto } from './dto/search-transactions.dto';

@Controller('api/branch-stock')
export class BranchStockController {
  constructor(private readonly branchStockService: BranchStockService) {}

  @Get('balances')
  async getStockBalances(
    @Query() query: SearchStockDto,
  ): Promise<BranchItemStock[]> {
    return await this.branchStockService.getStockBalances(query);
  }

  @Get('balances/:branchCode/:itemCode')
  async getStockBalance(
    @Param('branchCode') branchCode: string,
    @Param('itemCode') itemCode: string,
  ): Promise<BranchItemStock> {
    return await this.branchStockService.getStockBalance(
      branchCode,
      itemCode,
    );
  }

  @Post('stock-in')
  async stockIn(@Body() dto: StockInDto): Promise<BranchItemStock> {
    return await this.branchStockService.stockIn(dto);
  }

  @Post('adjust')
  async adjustStock(
    @Body() dto: AdjustStockDto,
  ): Promise<BranchItemStock> {
    return await this.branchStockService.adjustStock(dto);
  }

  @Post('issue-giveaway')
  async issueGiveaway(
    @Body() dto: IssueGiveawayDto,
  ): Promise<BranchItemStock> {
    return await this.branchStockService.issueGiveaway(
      dto.branch_code,
      dto.item_code,
      dto.quantity,
      dto.created_by,
      dto.reference,
    );
  }

  @Get('transactions')
  async getTransactions(
    @Query() query: SearchTransactionsDto,
  ): Promise<StockTransaction[]> {
    return await this.branchStockService.getTransactions(query);
  }
}
