'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Lightbulb, TrendingUp, CircleDollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPlannerSuggestion, PlannerState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  currentAge: z.coerce.number().min(18, 'Must be at least 18.'),
  retirementAge: z.coerce.number().min(19, 'Must be older than current age.'),
  initialInvestment: z.coerce.number().min(0, 'Cannot be negative.'),
  monthlyContribution: z.coerce.number().min(0, 'Cannot be negative.'),
  desiredMonthlyIncome: z.coerce.number().min(1, 'Must be a positive number.'),
  riskTolerance: z.enum(['low', 'medium', 'high']),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useAppTranslation();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('planner.form.analyzingButton')}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {t('planner.form.getPlanButton')}
        </>
      )}
    </Button>
  );
}

const chartConfig = {
  value: { label: 'Value', color: 'hsl(var(--accent))' },
} satisfies ChartConfig;

export default function PlannerForm() {
  const { toast } = useToast();
  const { t } = useAppTranslation();
  const initialState: PlannerState = { data: null, error: null };
  const [state, formAction] = useActionState(getPlannerSuggestion, initialState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: 30,
      retirementAge: 65,
      initialInvestment: 10000,
      monthlyContribution: 500,
      desiredMonthlyIncome: 5000,
      riskTolerance: 'medium',
    },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: t('planner.form.error.title'),
        description: state.error,
      });
    }
  }, [state.error, toast, t]);
  
  const generateProjectionData = (result: PlannerState['data']) => {
    if (!result) return [];
    
    const years = Array.from({length: 5}).map((_, i) => {
        const year = new Date().getFullYear() + (i * 5);
        return { year, value: result.projectedTotalValue * (0.2 + i * 0.2) };
    });
    years.push({ year: new Date().getFullYear() + 25, value: result.projectedTotalValue });
    return years;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <form action={formAction}>
            <CardHeader>
              <CardTitle>{t('planner.form.title')}</CardTitle>
              <CardDescription>{t('planner.form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="currentAge"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('planner.form.currentAge.label')}</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="retirementAge"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('planner.form.retirementAge.label')}</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="initialInvestment"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('planner.form.initialInvestment.label')}</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="monthlyContribution"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('planner.form.monthlyContribution.label')}</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="desiredMonthlyIncome"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('planner.form.desiredMonthlyIncome.label')}</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                  <FormField
                    control={form.control}
                    name="riskTolerance"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t('oracle.form.risk.label')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex h-10 items-center space-x-4 pt-2"
                            name={field.name}
                          >
                             <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="low" /></FormControl>
                                <FormLabel className="font-normal">{t('oracle.form.risk.low')}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="medium" /></FormControl>
                                <FormLabel className="font-normal">{t('oracle.form.risk.medium')}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="high" /></FormControl>
                                <FormLabel className="font-normal">{t('oracle.form.risk.high')}</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>{t('planner.results.title')}</CardTitle>
            <CardDescription>{t('planner.results.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {state.data ? (
              <div className="space-y-6">
                <div className={cn(
                    "flex items-start gap-4 rounded-lg border p-4",
                    state.data.isFeasible ? "border-green-500/50 bg-green-500/10" : "border-amber-500/50 bg-amber-500/10"
                )}>
                  {state.data.isFeasible ? <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" /> : <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-500" />}
                  <div>
                    <h3 className="font-bold text-lg">
                      {state.data.isFeasible ? t('planner.results.feasible.title') : t('planner.results.infeasible.title')}
                    </h3>
                    <p className="text-muted-foreground">{state.data.diagnosis}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
                    <h4 className="font-bold text-lg flex items-center gap-2"><Lightbulb/> {t('planner.results.advice.title')}</h4>
                    <p className='text-primary'>{state.data.actionableAdvice}</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 border-2 border-foreground brutalist-shadow text-center">
                        <div className='space-y-2'>
                            <p className='text-muted-foreground'>{t('planner.results.projectedValue.label')}</p>
                            <p className='text-4xl font-bold text-primary'>${state.data.projectedTotalValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-accent/20 border-2 border-accent brutalist-shadow text-center">
                        <div className='space-y-2'>
                            <p className='text-muted-foreground'>{t('planner.results.projectedIncome.label')}</p>
                            <p className='text-4xl font-bold text-accent'>${state.data.projectedMonthlyIncome.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-sm border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">{t('planner.placeholder.title')}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  {t('planner.placeholder.description')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
