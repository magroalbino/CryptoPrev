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

const defiTopics = [
  'What is DeFi?',
  'What is APY (Annual Percentage Yield)?',
  'What are Smart Contracts?',
  'What are Stablecoins?',
  'What is Impermanent Loss?',
  'What are the risks of DeFi?',
  'What is a Liquidity Pool?',
  'What is Yield Farming?',
];

type ExplanationCache = {
  [key: string]: string;
};

export default function LearnAccordion() {
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<ExplanationCache>({});

  const handleValueChange = async (value: string) => {
    if (!value || explanations[value]) {
      // Don't fetch if panel is closing or already has content
      return;
    }

    setLoadingTopic(value);
    try {
      const result = await explainDeFiConcept({ concept: value });
      setExplanations((prev) => ({ ...prev, [value]: result.explanation }));
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanations((prev) => ({
        ...prev,
        [value]: 'Sorry, there was an error fetching the explanation. Please try again.',
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
