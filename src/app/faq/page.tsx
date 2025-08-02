'use client';
import FAQAccordion from '@/components/faq/faq-accordion';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function FAQPage() {
  const { t } = useAppTranslation();
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('faq.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('faq.description')}
        </p>
      </div>
      <FAQAccordion />
    </div>
  );
}
