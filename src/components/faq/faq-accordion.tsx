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

  const faqTopicKeys = [
    'whatIsCryptoPrev',
    'howDoesItWork',
    'whatIsDeFi',
    'whatIsApy',
    'whatAreSmartContracts',
    'whatAreStablecoins',
    'whatAreTheRisks',
    'whatIsYieldFarming',
  ];

  const handleValueChange = async (value: string) => {
    // `value` here is the conceptKey
    if (!value || explanations[value]) {
      // Don't fetch if panel is closing or already has content
      return;
    }

    setLoadingTopic(value);
    try {
      const result = await explainDeFiConcept({ conceptKey: value });
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
      {faqTopicKeys.map((key) => {
        const topicText = t(`faq.topics.${key}`);
        return (
          <AccordionItem value={key} key={key} className="bg-card">
            <AccordionTrigger className="p-4 text-left text-lg font-bold hover:no-underline">
              {topicText}
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              {loadingTopic === key ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-base text-muted-foreground">{explanations[key]}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
