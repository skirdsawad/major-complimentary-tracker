'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ItemType } from '@/types/giveaway-item';
import {
  getGiveawayItem,
  updateGiveawayItem,
} from '@/services/giveaway-item.service';
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

interface GiveawayItemEditFormProps {
  itemCode: string;
}

export function GiveawayItemEditForm({ itemCode }: GiveawayItemEditFormProps) {
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<ItemType>(ItemType.OTHER);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      try {
        const item = await getGiveawayItem(itemCode);
        setItemName(item.item_name);
        setItemType(item.item_type);
      } catch {
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemCode]);

  function handleItemNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItemName(e.target.value);
  }

  function handleItemTypeChange(value: string) {
    setItemType(value as ItemType);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!itemName) {
      setError('Item name is required.');

      return;
    }

    setSubmitting(true);
    try {
      await updateGiveawayItem(itemCode, {
        item_name: itemName,
        item_type: itemType,
      });
      router.push('/giveaway-items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/giveaway-items');
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Giveaway Item: {itemCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="item_code">Item Code</Label>
            <Input id="item_code" value={itemCode} disabled />
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
              {submitting ? 'Saving...' : 'Save'}
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
