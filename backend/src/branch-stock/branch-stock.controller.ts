import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BranchStockService } from './branch-stock.service';
import { StockInDto } from './dto/stock-in.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { IssueGiveawayDto } from './dto/issue-giveaway.dto';
import { SearchStockDto } from './dto/search-stock.dto';
import { SearchTransactionsDto } from './dto/search-transactions.dto';

@Controller('api/branch-stock')
export class BranchStockController {
  constructor(private readonly branchStockService: BranchStockService) {}

  @Get('balances')
  getStockBalances(@Query() query: SearchStockDto) {
    return this.branchStockService.getStockBalances(query);
  }

  @Get('balances/:branchCode/:itemCode')
  getStockBalance(
    @Param('branchCode') branchCode: string,
    @Param('itemCode') itemCode: string,
  ) {
    return this.branchStockService.getStockBalance(branchCode, itemCode);
  }

  @Post('stock-in')
  stockIn(@Body() dto: StockInDto) {
    return this.branchStockService.stockIn(dto);
  }

  @Post('adjust')
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.branchStockService.adjustStock(dto);
  }

  @Post('issue-giveaway')
  issueGiveaway(@Body() dto: IssueGiveawayDto) {
    return this.branchStockService.issueGiveaway(
      dto.branch_code,
      dto.item_code,
      dto.quantity,
      dto.created_by,
      dto.reference,
    );
  }

  @Get('transactions')
  getTransactions(@Query() query: SearchTransactionsDto) {
    return this.branchStockService.getTransactions(query);
  }
}
