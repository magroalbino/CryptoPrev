'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import { Loader2, Sparkles, AlertTriangle, BadgePercent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOracleSuggestion } from '@/app/oracle/actions';
import type { OracleState } from '@/app/oracle/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  stablecoin: z.string().min(1, 'Please select a stablecoin.'),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  investmentAmount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .min(100, 'Minimum investment is $100.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Suggestion
        </>
      )}
    </Button>
  );
}

export default function OracleForm() {
  const { toast } = useToast();
  const initialState: OracleState = { data: null, error: null };
  const [state, formAction] = useFormState(getOracleSuggestion, initialState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stablecoin: 'USDC',
      riskTolerance: 'medium',
      investmentAmount: 1000,
    },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <form action={formAction} className="space-y-8">
          <CardHeader>
            <CardTitle>Analysis Criteria</CardTitle>
            <CardDescription>
              Tell us your preferences and we'll find the best strategy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="stablecoin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stablecoin</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        name={field.name}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stablecoin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="DAI">DAI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskTolerance"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Risk Tolerance</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          name={field.name}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="low" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Low
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="medium" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Medium
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="high" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              High
                            </FormLabel>
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

      <div className="lg:col-span-2">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>AI-Powered Suggestion</CardTitle>
            <CardDescription>
              Our oracle's recommendation will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.data ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{state.data.protocolName}</h3>
                    <p className="text-sm text-muted-foreground">{state.data.lockupPeriod}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-green-500 bg-green-500/10 px-4 py-2">
                    <BadgePercent className="h-5 w-5 text-green-700 dark:text-green-400" />
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">{state.data.apy.toFixed(2)}% APY</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Strategy</h4>
                    <p className="text-sm text-muted-foreground">{state.data.strategyDescription}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold">Estimated Monthly Yield</h4>
                    <p className="text-lg font-semibold text-primary">${state.data.estimatedMonthlyYield.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Based on your investment amount.</p>
                  </div>
                  
                  <Separator />

                  <div>
                    <h4 className="font-semibold">Potential Risks</h4>
                    <div className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-amber-800 dark:text-amber-300">{state.data.risks}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-center text-muted-foreground">
                        <Sparkles className="mx-auto h-12 w-12" />
                        <p className="mt-2">Your results will be displayed here.</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
