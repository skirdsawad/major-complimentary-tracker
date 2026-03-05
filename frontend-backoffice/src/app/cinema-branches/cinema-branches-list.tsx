'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Ban } from 'lucide-react';
import { CinemaBranch } from '@/types/cinema-branch';
import {
  deactivateCinemaBranch,
  getCinemaBranches,
} from '@/services/cinema-branch.service';
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

const ALL_STATUS = 'ALL_STATUS';

export function CinemaBranchesList() {
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const [deactivateTarget, setDeactivateTarget] =
    useState<CinemaBranch | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        search?: string;
        isActive?: boolean;
      } = {};

      if (search) {
        params.search = search;
      }
      if (statusFilter !== ALL_STATUS) {
        params.isActive = statusFilter === 'true';
      }

      const data = await getCinemaBranches(params);
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
  }

  function handleDeactivateClick(branch: CinemaBranch) {
    setDeactivateTarget(branch);
  }

  function handleDeactivateDialogClose() {
    setDeactivateTarget(null);
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) {
      return;
    }

    try {
      await deactivateCinemaBranch(deactivateTarget.branch_code);
      setDeactivateTarget(null);
      fetchBranches();
    } catch (error) {
      console.error('Failed to deactivate branch:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cinema Branches</h1>
        <Button asChild>
          <Link href="/cinema-branches/create">Create Branch</Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by code or name..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
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
            <TableHead>Branch Code</TableHead>
            <TableHead>Branch Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No branches found.
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch.branch_code}>
                <TableCell className="font-medium">
                  {branch.branch_code}
                </TableCell>
                <TableCell>{branch.branch_name}</TableCell>
                <TableCell>
                  <Badge
                    variant={branch.is_active ? 'default' : 'secondary'}
                  >
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild title="Edit">
                      <Link
                        href={`/cinema-branches/${branch.branch_code}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    {branch.is_active && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        title="Deactivate"
                        onClick={() => handleDeactivateClick(branch)}
                      >
                        <Ban className="h-4 w-4" />
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
            <DialogTitle>Deactivate Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;
              {deactivateTarget?.branch_name}&quot;? This branch will no
              longer be available for giveaway distribution.
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
