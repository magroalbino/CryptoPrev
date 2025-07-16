'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', apy: 4.1 },
  { month: 'February', apy: 4.5 },
  { month: 'March', apy: 4.2 },
  { month: 'April', apy: 4.8 },
  { month: 'May', apy: 5.1 },
  { month: 'June', apy: 5.2 },
];

const chartConfig = {
  apy: {
    label: 'APY (%)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function YieldChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="apy"
          type="monotone"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
