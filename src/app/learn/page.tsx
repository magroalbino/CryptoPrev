'use client';
import LearnAccordion from '@/components/learn/learn-accordion';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function LearnPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('learn.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('learn.description')}
        </p>
      </div>
      <LearnAccordion />
    </div>
  );
}
