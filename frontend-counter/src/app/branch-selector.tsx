'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useBranch } from '@/contexts/branch-context';
import { getActiveCinemaBranches } from '@/services/cinema-branch.service';
import { CinemaBranch } from '@/types/cinema-branch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function BranchSelector() {
  const { selectBranch } = useBranch();
  const [branches, setBranches] = useState<CinemaBranch[]>([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getActiveCinemaBranches()
      .then(setBranches)
      .catch(() => setError('Failed to load branches'))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const branch = branches.find((b) => b.branch_code === selectedBranchCode);
    if (!branch || !staffName.trim()) {
      return;
    }

    selectBranch(branch, staffName.trim());
  }

  function handleBranchChange(value: string) {
    setSelectedBranchCode(value);
  }

  function handleStaffNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStaffName(e.target.value);
  }

  const isFormValid = selectedBranchCode && staffName.trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complimentary Tracker</CardTitle>
          <CardDescription>Select your branch and enter your name to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select
                value={selectedBranchCode}
                onValueChange={handleBranchChange}
                disabled={loading}
              >
                <SelectTrigger id="branch" className="w-full">
                  <SelectValue placeholder={loading ? 'Loading...' : 'Select a branch'} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branch_code} value={branch.branch_code}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffName">Staff Name *</Label>
              <Input
                id="staffName"
                value={staffName}
                onChange={handleStaffNameChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!isFormValid}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
