'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ItemType } from '@/types/giveaway-item';
import { createGiveawayItem } from '@/services/giveaway-item.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function GiveawayItemForm() {
  const router = useRouter();
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<ItemType | ''>('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleItemCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItemCode(e.target.value);
  }

  function handleItemNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItemName(e.target.value);
  }

  function handleItemTypeChange(value: string) {
    setItemType(value as ItemType);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!itemCode || !itemName || !itemType) {
      setError('All fields are required.');

      return;
    }

    setSubmitting(true);
    try {
      await createGiveawayItem({
        item_code: itemCode,
        item_name: itemName,
        item_type: itemType as ItemType,
      });
      router.push('/giveaway-items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/giveaway-items');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Giveaway Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="item_code">Item Code</Label>
            <Input
              id="item_code"
              value={itemCode}
              onChange={handleItemCodeChange}
              placeholder="e.g., POSTER-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={itemName}
              onChange={handleItemNameChange}
              placeholder="e.g., Limited Edition Poster"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_type">Item Type</Label>
            <Select value={itemType} onValueChange={handleItemTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ItemType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
