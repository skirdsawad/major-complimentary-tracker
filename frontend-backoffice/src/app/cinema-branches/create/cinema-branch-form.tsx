'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCinemaBranch } from '@/services/cinema-branch.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function CinemaBranchForm() {
  const router = useRouter();
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleBranchCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBranchCode(e.target.value);
  }

  function handleBranchNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBranchName(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!branchCode || !branchName) {
      setError('All fields are required.');

      return;
    }

    setSubmitting(true);
    try {
      await createCinemaBranch({
        branch_code: branchCode,
        branch_name: branchName,
      });
      router.push('/cinema-branches');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create branch',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/cinema-branches');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Cinema Branch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="branch_code">Branch Code</Label>
            <Input
              id="branch_code"
              value={branchCode}
              onChange={handleBranchCodeChange}
              placeholder="e.g., BKK-SIAM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_name">Branch Name</Label>
            <Input
              id="branch_name"
              value={branchName}
              onChange={handleBranchNameChange}
              placeholder="e.g., Major Cineplex Siam"
            />
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
