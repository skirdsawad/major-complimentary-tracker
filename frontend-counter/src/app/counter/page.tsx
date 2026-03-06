'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/contexts/branch-context';
import { GiveawayIssuanceScreen } from '../giveaway-issuance-screen';

export default function CounterPage() {
  const { selectedBranch, isHydrated } = useBranch();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !selectedBranch) {
      router.replace('/');
    }
  }, [isHydrated, selectedBranch, router]);

  if (!isHydrated || !selectedBranch) {
    return null;
  }

  return <GiveawayIssuanceScreen />;
}
