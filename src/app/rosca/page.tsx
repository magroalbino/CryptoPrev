// src/app/rosca/page.tsx
'use client';
import RoscaDashboard from '@/components/rosca/rosca-dashboard';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function RoscaPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('rosca.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('rosca.description')}
        </p>
      </div>
      <RoscaDashboard />
    </div>
  );
}
