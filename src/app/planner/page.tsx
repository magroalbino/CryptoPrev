'use client';
import PlannerForm from '@/components/planner/planner-form';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function PlannerPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('planner.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('planner.description')}
        </p>
      </div>
      <PlannerForm />
    </div>
  );
}
