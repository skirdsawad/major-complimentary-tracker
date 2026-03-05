'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { GiveawayItem, ItemType } from '@/types/giveaway-item';
import {
  deactivateGiveawayItem,
  getGiveawayItems,
} from '@/services/giveaway-item.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ALL_TYPES = 'ALL_TYPES';
const ALL_STATUS = 'ALL_STATUS';

export function GiveawayItemsList() {
  const [items, setItems] = useState<GiveawayItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const [deactivateTarget, setDeactivateTarget] =
    useState<GiveawayItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        search?: string;
        itemType?: ItemType;
        isActive?: boolean;
      } = {};

      if (search) {
        params.search = search;
      }
      if (typeFilter !== ALL_TYPES) {
        params.itemType = typeFilter as ItemType;
      }
      if (statusFilter !== ALL_STATUS) {
        params.isActive = statusFilter === 'true';
      }

      const data = await getGiveawayItems(params);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleTypeFilterChange(value: string) {
    setTypeFilter(value);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
  }

  function handleDeactivateClick(item: GiveawayItem) {
    setDeactivateTarget(item);
  }

  function handleDeactivateDialogClose() {
    setDeactivateTarget(null);
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) {
      return;
    }

    try {
      await deactivateGiveawayItem(deactivateTarget.item_code);
      setDeactivateTarget(null);
      fetchItems();
    } catch (error) {
      console.error('Failed to deactivate item:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giveaway Items</h1>
        <Button asChild>
          <Link href="/giveaway-items/create">Create Item</Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by code or name..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>All Types</SelectItem>
            {Object.values(ItemType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Code</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
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
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.item_code}>
                <TableCell className="font-medium">
                  {item.item_code}
                </TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.item_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.is_active ? 'default' : 'secondary'}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/giveaway-items/${item.item_code}/edit`}
                      >
                        Edit
                      </Link>
                    </Button>
                    {item.is_active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivateClick(item)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={deactivateTarget !== null}
        onOpenChange={handleDeactivateDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;
              {deactivateTarget?.item_name}&quot;? This item will no longer
              be available for giveaway.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeactivateDialogClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivateConfirm}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
