'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, PiggyBank, Target } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

type SimulationResult = {
  year: number;
  value: number;
}[];

export default function SimulatorForm() {
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const currentAge = Number(formData.get('currentAge') as string);
        const retirementAge = Number(formData.get('retirementAge') as string);
        const initialInvestment = Number(formData.get('initialInvestment') as string);
        const monthlyContribution = Number(formData.get('monthlyContribution') as string);
        const apy = Number(formData.get('apy') as string) / 100;
        
        const yearsToRetire = retirementAge - currentAge;
        if(yearsToRetire <= 0) {
            setResult([]);
            return;
        }

        const data: SimulationResult = [];
        let currentValue = initialInvestment;
        
        for (let i = 1; i <= yearsToRetire; i++) {
            currentValue += monthlyContribution * 12;
            currentValue *= (1 + apy);
            if(i % 5 === 0 || i === 1 || i === yearsToRetire) { // Add data points every 5 years for readability
                data.push({ year: currentAge + i, value: Math.round(currentValue) });
            }
        }
        setResult(data);
    };


  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
        <div className='lg:col-span-2'>
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Simulation Parameters</CardTitle>
                        <CardDescription>
                            Enter your details to project your investment growth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentAge">Current Age</Label>
                                <Input id="currentAge" name="currentAge" type="number" defaultValue="30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="retirementAge">Retirement Age</Label>
                                <Input id="retirementAge" name="retirementAge" type="number" defaultValue="65" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="initialInvestment">Initial Investment ($)</Label>
                            <Input id="initialInvestment" name="initialInvestment" type="number" defaultValue="5000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monthlyContribution">Monthly Contribution ($)</Label>
                            <Input id="monthlyContribution" name="monthlyContribution" type="number" defaultValue="500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apy">Expected APY (%)</Label>
                            <Input id="apy" name="apy" type="number" defaultValue="7.5" step="0.1" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">
                            <BarChart className="mr-2"/>
                            Run Simulation
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
        <div className='lg:col-span-3'>
            <Card className="min-h-full">
                <CardHeader>
                    <CardTitle>Projected Growth</CardTitle>
                    <CardDescription>
                        Here's how your investment could grow over time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {result ? (
                       result.length > 0 ? (
                        <div className='space-y-6'>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={result}>
                                        <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value)/1000}k`}/>
                                        <Tooltip content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />} cursor={{fill: 'hsl(var(--accent) / 0.2)'}}/>
                                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="flex items-center justify-center p-6 bg-secondary/50 border-2 border-foreground brutalist-shadow text-center">
                                <div className='space-y-2'>
                                    <p className='text-muted-foreground'>At Retirement (Age {result[result.length-1].year})</p>
                                    <p className='text-4xl font-bold text-primary'>${result[result.length - 1].value.toLocaleString()}</p>
                                    <p className='text-muted-foreground'>Projected Total Value</p>
                                </div>
                            </div>
                        </div>
                       ) : (
                         <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Invalid Age Range</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                Please ensure your retirement age is greater than your current age.
                            </p>
                        </div>
                       )
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Your projection will appear here.</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                Fill in your details and run the simulation to see your financial future.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
