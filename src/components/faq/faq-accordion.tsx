'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { explainDeFiConcept } from '@/ai/flows/explain-defi-concept';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function FAQAccordion() {
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
  const { t } = useAppTranslation();

  const faqTopics = [
    t('faq.topics.whatIsCryptoPrev'),
    t('faq.topics.howDoesItWork'),
    t('faq.topics.whatIsDeFi'),
    t('faq.topics.whatIsApy'),
    t('faq.topics.whatAreSmartContracts'),
    t('faq.topics.whatAreStablecoins'),
    t('faq.topics.whatAreTheRisks'),
    t('faq.topics.whatIsYieldFarming'),
  ];

  const handleValueChange = async (value: string) => {
    if (!value || explanations[value]) {
      // Don't fetch if panel is closing or already has content
      return;
    }

    setLoadingTopic(value);
    try {
      // We pass the english version to the AI flow to ensure consistency
      const conceptKey = Object.keys(t('faq.topics', { returnObjects: true }) as any).find(
        key => t(`faq.topics.${key}`) === value
      ) || '';
      
      const englishConcept = t(`faq.topics.${conceptKey}`, { lng: 'en' });

      const result = await explainDeFiConcept({ concept: englishConcept });
      setExplanations((prev) => ({ ...prev, [value]: result.explanation }));
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanations((prev) => ({
        ...prev,
        [value]: t('faq.error'),
      }));
    } finally {
      setLoadingTopic(null);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-2" onValueChange={handleValueChange}>
      {faqTopics.map((topic) => (
        <AccordionItem value={topic} key={topic} className="brutalist-border bg-card">
          <AccordionTrigger className="p-4 text-left text-lg font-bold hover:no-underline">
            {topic}
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            {loadingTopic === topic ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-base text-muted-foreground">{explanations[topic]}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
