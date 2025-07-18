'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { explainDeFiConcept } from '@/ai/flows/explain-defi-concept';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function LearnAccordion() {
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
  const { t } = useAppTranslation();

  const defiTopics = [
    t('learn.topics.whatIsDeFi'),
    t('learn.topics.whatIsApy'),
    t('learn.topics.whatAreSmartContracts'),
    t('learn.topics.whatAreStablecoins'),
    t('learn.topics.whatIsImpermanentLoss'),
    t('learn.topics.whatAreTheRisks'),
    t('learn.topics.whatIsLiquidityPool'),
    t('learn.topics.whatIsYieldFarming'),
  ];

  const handleValueChange = async (value: string) => {
    if (!value || explanations[value]) {
      // Don't fetch if panel is closing or already has content
      return;
    }

    setLoadingTopic(value);
    try {
      // We pass the english version to the AI flow
      const conceptKey = Object.keys(t('learn.topics', { returnObjects: true }) as any).find(
        key => t(`learn.topics.${key}`) === value
      ) || '';
      
      const englishConcept = t(`learn.topics.${conceptKey}`, { lng: 'en' });

      const result = await explainDeFiConcept({ concept: englishConcept });
      setExplanations((prev) => ({ ...prev, [value]: result.explanation }));
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanations((prev) => ({
        ...prev,
        [value]: t('learn.error'),
      }));
    } finally {
      setLoadingTopic(null);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-2" onValueChange={handleValueChange}>
      {defiTopics.map((topic) => (
        <AccordionItem value={topic} key={topic} className="brutalist-border glassmorphic">
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
