'use client';
import { useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { Loader2, Sparkles, Wand } from 'lucide-react';

import FAQAccordion from '@/components/faq/faq-accordion';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { askAiGuide } from '@/ai/flows/ai-guide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface GuideState {
  answer: string | null;
  error: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useAppTranslation();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('faq.guide.thinking')}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {t('faq.guide.askButton')}
        </>
      )}
    </Button>
  );
}


export default function FAQPage() {
  const { t } = useAppTranslation();
  const { pending } = useFormStatus();
  
  const initialState: GuideState = { answer: null, error: null };
  const [state, formAction] = useFormState(askAiGuide, initialState);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('faq.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('faq.description')}
        </p>
      </div>
      
      <Card className="brutalist-shadow">
        <CardHeader>
          <CardTitle>{t('faq.guide.title')}</CardTitle>
          <CardDescription>{t('faq.guide.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Textarea
              name="question"
              placeholder={t('faq.guide.placeholder')}
              className="min-h-24"
              required
            />
            <SubmitButton />
          </form>
          {pending && (
             <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
             </div>
          )}
          {state?.answer && !pending && (
            <div className="mt-6">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Wand className="text-accent"/> {t('faq.guide.answerTitle')}</h3>
                <p className="text-base text-muted-foreground">{state.answer}</p>
            </div>
          )}
          {state?.error && !pending && (
            <p className="mt-4 text-sm text-destructive">{state.error}</p>
          )}
        </CardContent>
      </Card>

      <div className='space-y-4'>
        <h2 className='text-2xl font-bold text-center'>{t('faq.commonQuestions')}</h2>
        <FAQAccordion />
      </div>
    </div>
  );
}
