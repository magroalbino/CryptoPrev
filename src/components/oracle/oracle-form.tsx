'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto" variant="secondary">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export default function OracleForm() {
  const { toast } = useToast();
  const initialState: OracleState = { data: null, error: null };
  const [state, formAction] = useActionState(getOracleSuggestion, initialState);

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
          <CardHeader>
            <CardTitle>Oracle Parameters</CardTitle>
            <CardDescription>
              Provide your criteria to get AI-powered DeFi suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
                <FormField
                  control={form.control}
                  name="stablecoin"
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel className="font-bold">Stablecoin</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        name={field.name}
                      >
                        <FormControl>
                          <SelectTrigger className="brutalist-border">
                            <SelectValue placeholder="Select a stablecoin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="brutalist-border">
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
                    <FormItem className='flex-1'>
                      <FormLabel className="font-bold">Investment Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1000" {...field} className="brutalist-border"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskTolerance"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-3">
                      <FormLabel className="font-bold">Risk Tolerance</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex h-10 items-center space-x-4 pt-2"
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
                <SubmitButton />
              </div>
            </Form>
          </CardContent>
        </form>
      </Card>
      
      {state.data && state.data.suggestions.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
            {state.data.suggestions.map((suggestion, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex flex-col gap-4 rounded-lg sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-2xl">{suggestion.protocolName}</CardTitle>
                            <CardDescription>{suggestion.lockupPeriod}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2 rounded-sm border-2 border-foreground bg-accent px-4 py-2 text-accent-foreground brutalist-shadow">
                            <BadgePercent className="h-6 w-6" />
                            <span className="text-2xl font-bold">{suggestion.apy.toFixed(2)}% APY</span>
                          </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator className="border-t-2 border-dashed border-foreground/50"/>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">Strategy</h4>
                            <p className="text-muted-foreground text-sm">{suggestion.strategyDescription}</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">Est. Monthly Yield</h4>
                            <p className="text-3xl font-bold text-accent">${suggestion.estimatedMonthlyYield.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Based on your investment amount.</p>
                        </div>
                        <Separator className="border-t-2 border-dashed border-foreground/50"/>
                         <div>
                            <h4 className="font-bold text-lg">Potential Risks</h4>
                            <div className="mt-2 flex items-start gap-3 border-2 border-destructive/50 bg-destructive/10 p-4 text-sm">
                              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                              <p className="text-foreground">{suggestion.risks}</p>
                            </div>
                          </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-sm border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Your AI-powered suggestions will appear here.</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Submit your criteria to see the magic happen.
              </p>
          </div>
      )}
    </div>
  );
}
