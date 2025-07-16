import {
  Activity,
  ArrowUpRight,
  Calendar,
  CircleDollarSign,
  Landmark,
  Wallet,
} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DepositDialog from '@/components/dashboard/deposit-dialog';
import StatCard from '@/components/dashboard/stat-card';
import YieldChart from '@/components/dashboard/yield-chart';
import ProjectionChart from '@/components/dashboard/projection-chart';

const distributionHistory = [
  {
    id: 'dist_1',
    date: '2024-07-01',
    amount: 45.23,
    status: 'Paid',
    protocol: 'Aave',
  },
  {
    id: 'dist_2',
    date: '2024-06-01',
    amount: 42.88,
    status: 'Paid',
    protocol: 'Compound',
  },
  {
    id: 'dist_3',
    date: '2024-05-01',
    amount: 44.1,
    status: 'Paid',
    protocol: 'Aave',
  },
  {
    id: 'dist_4',
    date: '2024-04-01',
    amount: 41.5,
    status: 'Paid',
    protocol: 'Curve',
  },
];

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <DepositDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Balance"
          value="$10,482.50"
          description="+1.2% from last month"
          icon={<Wallet className="text-primary" />}
        />
        <StatCard
          title="Accumulated Rewards"
          value="$482.50"
          description="Total since inception"
          icon={<CircleDollarSign className="text-primary" />}
        />
        <StatCard
          title="Next Payout"
          value="15 days"
          description="July 31, 2024"
          icon={<Calendar className="text-primary" />}
        />
        <StatCard
          title="Active Protocol"
          value="Aave v3"
          description="Current APY: 5.2%"
          icon={<Activity className="text-primary" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Historical Yield (APY)</CardTitle>
            <CardDescription>
              Performance over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <YieldChart />
          </CardContent>
        </Card>
        <div className="col-span-1 flex flex-col gap-4 lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Lock-up Period</CardTitle>
              <CardDescription>
                Your funds are locked to maximize yield.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-background p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Minimum lock-up period
                </p>
                <p className="text-2xl font-bold">30 Days</p>
                <p className="text-xs text-muted-foreground">
                  Withdrawals are processed after this period.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Investment Growth</CardTitle>
              <CardDescription>
                Projected growth of your initial investment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectionChart initialInvestment={10000} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
          <CardDescription>
            A record of your monthly yield distributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributionHistory.map((dist) => (
                <TableRow key={dist.id}>
                  <TableCell>
                    <div className="font-medium">{dist.date}</div>
                  </TableCell>
                  <TableCell>{dist.protocol}</TableCell>
                  <TableCell className="text-right">${dist.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400">
                      {dist.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
