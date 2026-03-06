'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, PackagePlus, SlidersHorizontal } from 'lucide-react';
import { BranchItemStock, StockTransaction, StockTransactionType } from '@/types/branch-stock';
import { CinemaBranch } from '@/types/cinema-branch';
import { GiveawayItem } from '@/types/giveaway-item';
import {
  adjustStock,
  getStockBalances,
  getTransactions,
  stockIn,
} from '@/services/branch-stock.service';
import { getCinemaBranches } from '@/services/cinema-branch.service';
import { getGiveawayItems } from '@/services/giveaway-item.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ALL_BRANCHES = 'ALL_BRANCHES';
const ALL_ITEMS = 'ALL_ITEMS';

enum DialogMode {
  NONE = 'NONE',
  STOCK_IN = 'STOCK_IN',
  ADJUST = 'ADJUST',
  HISTORY = 'HISTORY',
}

export function StockManagementView() {
  const [stocks, setStocks] = useState<BranchItemStock[]>([]);
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [items, setItems] = useState<GiveawayItem[]>([]);
  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES);
  const [itemFilter, setItemFilter] = useState(ALL_ITEMS);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogMode, setDialogMode] = useState(DialogMode.NONE);
  const [formBranchCode, setFormBranchCode] = useState('');
  const [formItemCode, setFormItemCode] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formCreatedBy, setFormCreatedBy] = useState('');
  const [formTransactionType, setFormTransactionType] = useState(
    StockTransactionType.ADJUSTMENT_PLUS,
  );
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // History state
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [historyBranchCode, setHistoryBranchCode] = useState('');
  const [historyItemCode, setHistoryItemCode] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const params: { branch_code?: string; item_code?: string } = {};
      if (branchFilter !== ALL_BRANCHES) {
        params.branch_code = branchFilter;
      }
      if (itemFilter !== ALL_ITEMS) {
        params.item_code = itemFilter;
      }
      const data = await getStockBalances(params);
      setStocks(data);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  }, [branchFilter, itemFilter]);

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [branchData, itemData] = await Promise.all([
          getCinemaBranches({ isActive: true }),
          getGiveawayItems({ isActive: true }),
        ]);
        setBranches(branchData);
        setItems(itemData);
      } catch (error) {
        console.error('Failed to load reference data:', error);
      }
    }
    loadReferenceData();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  function handleBranchFilterChange(value: string) {
    setBranchFilter(value);
  }

  function handleItemFilterChange(value: string) {
    setItemFilter(value);
  }

  function resetForm() {
    setFormBranchCode('');
    setFormItemCode('');
    setFormQuantity('');
    setFormReason('');
    setFormCreatedBy('');
    setFormTransactionType(StockTransactionType.ADJUSTMENT_PLUS);
    setFormError('');
    setFormSubmitting(false);
  }

  function handleOpenStockIn(branchCode?: string, itemCode?: string) {
    resetForm();
    if (branchCode) {
      setFormBranchCode(branchCode);
    }
    if (itemCode) {
      setFormItemCode(itemCode);
    }
    setDialogMode(DialogMode.STOCK_IN);
  }

  function handleOpenAdjust(branchCode?: string, itemCode?: string) {
    resetForm();
    if (branchCode) {
      setFormBranchCode(branchCode);
    }
    if (itemCode) {
      setFormItemCode(itemCode);
    }
    setDialogMode(DialogMode.ADJUST);
  }

  async function handleOpenHistory(branchCode: string, itemCode: string) {
    setHistoryBranchCode(branchCode);
    setHistoryItemCode(itemCode);
    setDialogMode(DialogMode.HISTORY);
    setHistoryLoading(true);
    try {
      const data = await getTransactions({
        branch_code: branchCode,
        item_code: itemCode,
      });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleDialogClose() {
    setDialogMode(DialogMode.NONE);
  }

  function handleFormBranchCodeChange(value: string) {
    setFormBranchCode(value);
  }

  function handleFormItemCodeChange(value: string) {
    setFormItemCode(value);
  }

  function handleFormQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormQuantity(e.target.value);
  }

  function handleFormReasonChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormReason(e.target.value);
  }

  function handleFormCreatedByChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormCreatedBy(e.target.value);
  }

  function handleFormTransactionTypeChange(value: string) {
    setFormTransactionType(value as StockTransactionType);
  }

  async function handleStockInSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formBranchCode || !formItemCode || !formQuantity || !formCreatedBy) {
      setFormError('Please fill in all required fields.');

      return;
    }

    const qty = parseInt(formQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      setFormError('Quantity must be at least 1.');

      return;
    }

    setFormSubmitting(true);
    try {
      await stockIn({
        branch_code: formBranchCode,
        item_code: formItemCode,
        quantity: qty,
        reason: formReason || undefined,
        created_by: formCreatedBy,
      });
      setDialogMode(DialogMode.NONE);
      fetchStocks();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to stock in');
    } finally {
      setFormSubmitting(false);
    }
  }

  function getStockBalance(branchCode: string, itemCode: string): number {
    const stock = stocks.find(
      (s) => s.branch_code === branchCode && s.item_code === itemCode,
    );

    return stock ? stock.quantity : 0;
  }

  async function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formBranchCode || !formItemCode || !formQuantity || !formCreatedBy) {
      setFormError('Please fill in all required fields.');

      return;
    }

    const qty = parseInt(formQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      setFormError('Quantity must be at least 1.');

      return;
    }

    if (formTransactionType === StockTransactionType.ADJUSTMENT_MINUS) {
      const currentBalance = getStockBalance(formBranchCode, formItemCode);
      if (qty > currentBalance) {
        setFormError(
          `Cannot subtract ${qty}. Current stock balance is ${currentBalance}.`,
        );

        return;
      }
    }

    setFormSubmitting(true);
    try {
      await adjustStock({
        branch_code: formBranchCode,
        item_code: formItemCode,
        transaction_type: formTransactionType,
        quantity: qty,
        reason: formReason || undefined,
        created_by: formCreatedBy,
      });
      setDialogMode(DialogMode.NONE);
      fetchStocks();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setFormSubmitting(false);
    }
  }

  function getTransactionTypeBadgeVariant(
    type: StockTransactionType,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (type) {
      case StockTransactionType.STOCK_IN:
      case StockTransactionType.ADJUSTMENT_PLUS:
        return 'default';
      case StockTransactionType.ADJUSTMENT_MINUS:
      case StockTransactionType.ISSUE_GIVEAWAY:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenStockIn()}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Stock In
          </Button>
          <Button variant="outline" onClick={() => handleOpenAdjust()}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={branchFilter} onValueChange={handleBranchFilterChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANCHES}>All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.branch_code} value={branch.branch_code}>
                {branch.branch_code} - {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={itemFilter} onValueChange={handleItemFilterChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ITEMS}>All Items</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.item_code} value={item.item_code}>
                {item.item_code} - {item.item_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch Code</TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : stocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No stock balances found.
              </TableCell>
            </TableRow>
          ) : (
            stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.branch_code}</TableCell>
                <TableCell>{stock.item_code}</TableCell>
                <TableCell className="text-right">{stock.quantity}</TableCell>
                <TableCell>{formatDate(stock.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      title="Transaction History"
                      onClick={() => handleOpenHistory(stock.branch_code, stock.item_code)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      title="Stock In"
                      onClick={() => handleOpenStockIn(stock.branch_code, stock.item_code)}
                    >
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      title="Adjust Stock"
                      onClick={() => handleOpenAdjust(stock.branch_code, stock.item_code)}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Stock In Dialog */}
      <Dialog
        open={dialogMode === DialogMode.STOCK_IN}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock In</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStockInSubmit} className="space-y-4">
            {formError && (
              <div className="text-sm text-destructive">{formError}</div>
            )}
            <div className="space-y-2">
              <Label>Branch <span className="text-destructive">*</span></Label>
              <Select value={formBranchCode} onValueChange={handleFormBranchCodeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branch_code} value={branch.branch_code}>
                      {branch.branch_code} - {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Item <span className="text-destructive">*</span></Label>
              <Select value={formItemCode} onValueChange={handleFormItemCodeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.item_code} value={item.item_code}>
                      {item.item_code} - {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-in-quantity">Quantity <span className="text-destructive">*</span></Label>
              <Input
                id="stock-in-quantity"
                type="number"
                min="1"
                value={formQuantity}
                onChange={handleFormQuantityChange}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-in-reason">Reason</Label>
              <Input
                id="stock-in-reason"
                value={formReason}
                onChange={handleFormReasonChange}
                placeholder="Enter reason"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-in-created-by">Created By <span className="text-destructive">*</span></Label>
              <Input
                id="stock-in-created-by"
                value={formCreatedBy}
                onChange={handleFormCreatedByChange}
                placeholder="Enter your name"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? 'Submitting...' : 'Stock In'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog
        open={dialogMode === DialogMode.ADJUST}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            {formError && (
              <div className="text-sm text-destructive">{formError}</div>
            )}
            <div className="space-y-2">
              <Label>Branch <span className="text-destructive">*</span></Label>
              <Select value={formBranchCode} onValueChange={handleFormBranchCodeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branch_code} value={branch.branch_code}>
                      {branch.branch_code} - {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Item <span className="text-destructive">*</span></Label>
              <Select value={formItemCode} onValueChange={handleFormItemCodeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.item_code} value={item.item_code}>
                      {item.item_code} - {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Adjustment Type <span className="text-destructive">*</span></Label>
              <Select value={formTransactionType} onValueChange={handleFormTransactionTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockTransactionType.ADJUSTMENT_PLUS}>
                    Adjustment (+)
                  </SelectItem>
                  <SelectItem value={StockTransactionType.ADJUSTMENT_MINUS}>
                    Adjustment (-)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjust-quantity">Quantity <span className="text-destructive">*</span></Label>
              <Input
                id="adjust-quantity"
                type="number"
                min="1"
                value={formQuantity}
                onChange={handleFormQuantityChange}
                placeholder="Enter quantity"
              />
              {formTransactionType === StockTransactionType.ADJUSTMENT_MINUS &&
                formBranchCode &&
                formItemCode &&
                parseInt(formQuantity, 10) > getStockBalance(formBranchCode, formItemCode) && (
                  <p className="text-sm text-destructive">
                    Exceeds current stock balance ({getStockBalance(formBranchCode, formItemCode)})
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjust-reason">Reason</Label>
              <Input
                id="adjust-reason"
                value={formReason}
                onChange={handleFormReasonChange}
                placeholder="Enter reason"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjust-created-by">Created By <span className="text-destructive">*</span></Label>
              <Input
                id="adjust-created-by"
                value={formCreatedBy}
                onChange={handleFormCreatedByChange}
                placeholder="Enter your name"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? 'Submitting...' : 'Adjust'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog
        open={dialogMode === DialogMode.HISTORY}
        onOpenChange={handleDialogClose}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Transaction History: {historyBranchCode} / {historyItemCode}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Prev</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransactionTypeBadgeVariant(tx.transaction_type)}>
                          {tx.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{tx.quantity}</TableCell>
                      <TableCell className="text-right">{tx.previous_balance}</TableCell>
                      <TableCell className="text-right">{tx.new_balance}</TableCell>
                      <TableCell>{tx.reason}</TableCell>
                      <TableCell>{tx.created_by}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
