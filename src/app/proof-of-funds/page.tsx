// src/app/proof-of-funds/page.tsx
import { getPlatformStats } from '@/lib/platform-stats';
import ProofOfFundsContent from '@/components/proof-of-funds/content';
import { createTranslation } from '@/lib/i18n-server';

export default async function ProofOfFundsPage() {
  const stats = await getPlatformStats();
  const { t } = await createTranslation();

  return <ProofOfFundsContent stats={stats} t={t} />;
}
