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
    <Button type="submit" disabled={pending} size="lg" className="w-full">
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
    <div className="grid gap-8">
      <Card>
        <form action={formAction}>
          <CardContent className="pt-6">
            <Form {...form}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                          className="flex items-center space-x-4"
                          name={field.name}
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="low" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Low
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="medium" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Medium
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
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
          <CardFooter className="border-t px-6 py-4">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {state.data ? (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 rounded-lg sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl">{state.data.protocolName}</CardTitle>
                    <CardDescription>{state.data.lockupPeriod}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-accent/10 px-4 py-2 text-accent">
                    <BadgePercent className="h-6 w-6" />
                    <span className="text-2xl font-bold">{state.data.apy.toFixed(2)}% APY</span>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Strategy</h4>
                        <p className="text-muted-foreground">{state.data.strategyDescription}</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Estimated Monthly Yield</h4>
                        <p className="text-3xl font-bold text-primary">${state.data.estimatedMonthlyYield.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Based on your investment amount.</p>
                    </div>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-semibold text-lg">Potential Risks</h4>
                    <div className="mt-2 flex items-start gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-amber-800 dark:text-amber-300">{state.data.risks}</p>
                    </div>
                  </div>
            </CardContent>
        </Card>
      ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Waiting for your criteria</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Your AI-powered suggestion will appear here once you submit the form.
              </p>
          </div>
      )}
    </div>
  );
}
