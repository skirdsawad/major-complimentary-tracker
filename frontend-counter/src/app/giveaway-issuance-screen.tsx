'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Camera } from 'lucide-react';
import { useBranch } from '@/contexts/branch-context';
import { getBranchStockBalances, issueGiveaway } from '@/services/branch-stock.service';
import { getActiveGiveawayItems } from '@/services/giveaway-item.service';
import { BranchItemStock } from '@/types/branch-stock';
import { GiveawayItem } from '@/types/giveaway-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const QrScannerDialog = dynamic(
  () => import('@/components/qr-scanner-dialog').then((mod) => mod.QrScannerDialog),
  { ssr: false },
);

enum FeedbackType {
  SUCCESS = 'success',
  ERROR = 'error',
}

interface Feedback {
  type: FeedbackType;
  message: string;
}

export function GiveawayIssuanceScreen() {
  const { selectedBranch, staffName, clearBranch } = useBranch();

  const [stocks, setStocks] = useState<BranchItemStock[]>([]);
  const [items, setItems] = useState<GiveawayItem[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchStocks = useCallback(() => {
    if (!selectedBranch) {
      return;
    }

    setLoadingStocks(true);
    getBranchStockBalances(selectedBranch.branch_code)
      .then(setStocks)
      .catch(() => setStocks([]))
      .finally(() => setLoadingStocks(false));
  }, [selectedBranch]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    getActiveGiveawayItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
  }, []);

  function getStockQuantity(itemCode: string): number {
    const stock = stocks.find((s) => s.item_code === itemCode);

    return stock ? stock.quantity : 0;
  }

  function getQuantityBadgeVariant(qty: number): 'default' | 'secondary' | 'destructive' {
    if (qty <= 0) {
      return 'destructive';
    }
    if (qty <= 10) {
      return 'secondary';
    }

    return 'default';
  }

  function handleTicketNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTicketNumber(e.target.value);
  }

  function handleScanResult(value: string) {
    setTicketNumber(value);
  }

  function handleOpenScanner() {
    setScannerOpen(true);
  }

  function handleItemChange(value: string) {
    setSelectedItemCode(value);
  }

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuantity(e.target.value);
  }

  function handleChangeBranch() {
    clearBranch();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedBranch || !selectedItemCode || !ticketNumber.trim()) {
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setFeedback({ type: FeedbackType.ERROR, message: 'Quantity must be at least 1' });

      return;
    }

    const availableStock = getStockQuantity(selectedItemCode);
    if (qty > availableStock) {
      setFeedback({
        type: FeedbackType.ERROR,
        message: `Insufficient stock. Available: ${availableStock}, Requested: ${qty}`,
      });

      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await issueGiveaway({
        branch_code: selectedBranch.branch_code,
        item_code: selectedItemCode,
        quantity: qty,
        created_by: staffName,
        reference: ticketNumber.trim(),
      });

      const issuedItem = items.find((i) => i.item_code === selectedItemCode);
      setFeedback({
        type: FeedbackType.SUCCESS,
        message: `Issued ${qty}x ${issuedItem?.item_name ?? selectedItemCode} for ticket ${ticketNumber.trim()}`,
      });

      setTicketNumber('');
      setSelectedItemCode('');
      setQuantity('1');
      fetchStocks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to issue giveaway';
      setFeedback({ type: FeedbackType.ERROR, message });
    } finally {
      setSubmitting(false);
    }
  }

  const availableItems = items.filter((item) =>
    stocks.some((s) => s.item_code === item.item_code),
  );

  const isFormValid = ticketNumber.trim() && selectedItemCode && parseInt(quantity, 10) >= 1;

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{selectedBranch?.branch_name}</h1>
            <p className="text-sm text-muted-foreground">Staff: {staffName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleChangeBranch}>
            Change Branch
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Stock Overview */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Stock:</span>
          {loadingStocks || loadingItems ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : availableItems.length === 0 ? (
            <span className="text-sm text-muted-foreground">No items available at this branch</span>
          ) : (
            availableItems.map((item) => {
              const qty = getStockQuantity(item.item_code);

              return (
                <Badge key={item.item_code} variant={getQuantityBadgeVariant(qty)} className="gap-1">
                  {item.item_name}: {qty}
                </Badge>
              );
            })
          )}
        </div>

        {/* Issuance Form */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Giveaway</CardTitle>
            <CardDescription>Enter ticket details and select the giveaway item to issue</CardDescription>
          </CardHeader>
          <CardContent>
            {feedback && (
              <div
                className={`mb-4 rounded-md p-3 text-sm ${
                  feedback.type === FeedbackType.SUCCESS
                    ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {feedback.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Ticket Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="ticketNumber"
                    value={ticketNumber}
                    onChange={handleTicketNumberChange}
                    placeholder="Enter or scan ticket number"
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleOpenScanner}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <Select
                  value={selectedItemCode}
                  onValueChange={handleItemChange}
                  disabled={loadingItems}
                >
                  <SelectTrigger id="item" className="w-full">
                    <SelectValue placeholder={loadingItems ? 'Loading...' : 'Select an item'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => {
                      const stockQty = getStockQuantity(item.item_code);

                      return (
                        <SelectItem
                          key={item.item_code}
                          value={item.item_code}
                          disabled={stockQty <= 0}
                        >
                          {item.item_name} (Stock: {stockQty})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  required
                />
                {selectedItemCode && parseInt(quantity, 10) > getStockQuantity(selectedItemCode) && (
                  <p className="text-sm text-destructive">
                    Exceeds available stock ({getStockQuantity(selectedItemCode)})
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={!isFormValid || submitting}>
                {submitting ? 'Issuing...' : 'Issue Giveaway'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <QrScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={handleScanResult}
        />
      </main>
    </div>
  );
}
