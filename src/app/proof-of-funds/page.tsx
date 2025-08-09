// src/app/proof-of-funds/page.tsx
import { getPlatformStats } from '@/lib/platform-stats';
import ProofOfFundsContent from '@/components/proof-of-funds/content';

export default async function ProofOfFundsPage() {
  const stats = await getPlatformStats();

  return <ProofOfFundsContent stats={stats} />;
}
