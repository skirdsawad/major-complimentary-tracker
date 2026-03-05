'use client';

import { useBranch } from '@/contexts/branch-context';
import { BranchSelector } from './branch-selector';
import { GiveawayIssuanceScreen } from './giveaway-issuance-screen';

export default function Home() {
  const { selectedBranch } = useBranch();

  if (!selectedBranch) {
    return <BranchSelector />;
  }

  return <GiveawayIssuanceScreen />;
}
