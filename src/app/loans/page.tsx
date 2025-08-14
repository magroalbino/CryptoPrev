
'use client';
import LoansDashboard from '@/components/loans/loans-dashboard';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function LoansPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('loans.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('loans.description')}
        </p>
      </div>
      <LoansDashboard />
    </div>
  );
}
