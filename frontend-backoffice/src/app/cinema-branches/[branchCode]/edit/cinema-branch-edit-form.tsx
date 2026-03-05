'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCinemaBranch,
  updateCinemaBranch,
} from '@/services/cinema-branch.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CinemaBranchEditFormProps {
  branchCode: string;
}

export function CinemaBranchEditForm({
  branchCode,
}: CinemaBranchEditFormProps) {
  const router = useRouter();
  const [branchName, setBranchName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranch() {
      try {
        const branch = await getCinemaBranch(branchCode);
        setBranchName(branch.branch_name);
      } catch {
        setError('Failed to load branch');
      } finally {
        setLoading(false);
      }
    }

    loadBranch();
  }, [branchCode]);

  function handleBranchNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBranchName(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!branchName) {
      setError('Branch name is required.');

      return;
    }

    setSubmitting(true);
    try {
      await updateCinemaBranch(branchCode, {
        branch_name: branchName,
      });
      router.push('/cinema-branches');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update branch',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    router.push('/cinema-branches');
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Cinema Branch: {branchCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="branch_code">Branch Code</Label>
            <Input id="branch_code" value={branchCode} disabled />
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
