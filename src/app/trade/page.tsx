
'use client';
import TradeForm from '@/components/trade/trade-form';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function TradePage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-lg gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('trade.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('trade.description')}
        </p>
      </div>
      <TradeForm />
    </div>
  );
}
