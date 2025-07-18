'use client';
import SimulatorForm from '@/components/simulator/simulator-form';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function SimulatorPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('simulator.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('simulator.description')}
        </p>
      </div>
      <SimulatorForm />
    </div>
  );
}
