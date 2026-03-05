'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CinemaBranch } from '@/types/cinema-branch';

interface BranchContextValue {
  selectedBranch: CinemaBranch | null;
  staffName: string;
  selectBranch: (branch: CinemaBranch, staffName: string) => void;
  clearBranch: () => void;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<CinemaBranch | null>(null);
  const [staffName, setStaffName] = useState('');

  const selectBranch = useCallback((branch: CinemaBranch, name: string) => {
    setSelectedBranch(branch);
    setStaffName(name);
  }, []);

  const clearBranch = useCallback(() => {
    setSelectedBranch(null);
    setStaffName('');
  }, []);

  return (
    <BranchContext.Provider value={{ selectedBranch, staffName, selectBranch, clearBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }

  return context;
}
