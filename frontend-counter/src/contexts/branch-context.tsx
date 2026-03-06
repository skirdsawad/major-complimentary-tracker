'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CinemaBranch } from '@/types/cinema-branch';

const STORAGE_KEY = 'counter-branch-session';

interface BranchContextValue {
  selectedBranch: CinemaBranch | null;
  staffName: string;
  isHydrated: boolean;
  selectBranch: (branch: CinemaBranch, staffName: string) => void;
  clearBranch: () => void;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<CinemaBranch | null>(null);
  const [staffName, setStaffName] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSelectedBranch(parsed.branch);
        setStaffName(parsed.staffName);
      }
    } catch {
      // ignore parse errors
    }
    setIsHydrated(true);
  }, []);

  const selectBranch = useCallback((branch: CinemaBranch, name: string) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ branch, staffName: name }));
    setSelectedBranch(branch);
    setStaffName(name);
    router.push('/counter');
  }, [router]);

  const clearBranch = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSelectedBranch(null);
    setStaffName('');
    router.replace('/');
  }, [router]);

  return (
    <BranchContext.Provider value={{ selectedBranch, staffName, isHydrated, selectBranch, clearBranch }}>
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
