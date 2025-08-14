// src/app/proof-of-funds/page.tsx
import { getPlatformStats } from '@/lib/platform-stats';
import ProofOfFundsContent from '@/components/proof-of-funds/content';

export const dynamic = 'force-dynamic';

export default async function ProofOfFundsPage() {
  const stats = await getPlatformStats();

  return <ProofOfFundsContent stats={stats} />;
}
