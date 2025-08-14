'use client';

import { useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const chartConfig = {
  value: {
    label: 'Value ($)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const generateProjectionData = (
  initial: number,
  apy: number,
  years: number
) => {
  const data = [];
  let currentValue = initial;
  data.push({ year: 'Now', value: Math.round(currentValue) });
  for (let i = 1; i <= years; i++) {
    currentValue *= 1 + apy;
    data.push({ year: `Year ${i}`, value: Math.round(currentValue) });
  }
  return data;
};

type ProjectionPeriod = '1y' | '5y' | '10y' | '20y' | '30y';

export default function ProjectionChart({
  initialInvestment,
}: {
  initialInvestment: number;
}) {
  const [period, setPeriod] = useState<ProjectionPeriod>('5y');

  const yearsMap: Record<ProjectionPeriod, number> = {
    '1y': 1,
    '5y': 5,
    '10y': 10,
    '20y': 20,
    '30y': 30,
  };

  const data = generateProjectionData(
    initialInvestment,
    0.052,
    yearsMap[period]
  );

  return (
    <div className="space-y-4">
      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as ProjectionPeriod)}
        className="self-start"
      >
        <TabsList>
          <TabsTrigger value="1y">1 Year</TabsTrigger>
          <TabsTrigger value="5y">5 Years</TabsTrigger>
          <TabsTrigger value="10y">10 Years</TabsTrigger>
          <TabsTrigger value="20y">20 Years</TabsTrigger>
          <TabsTrigger value="30y">30 Years</TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={chartConfig} className="h-[150px] w-full">
        <LineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.5)"/>
          <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            domain={['dataMin', 'dataMax']}
            hide
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent formatter={(value) => `$${Number(value).toLocaleString()}`} />}
          />
          <Line
            dataKey="value"
            type="monotone"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
