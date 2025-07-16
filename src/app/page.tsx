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
    <div className="flex-1 space-y-6">
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
          icon={<Wallet className="text-accent" />}
        />
        <StatCard
          title="Accumulated Rewards"
          value="$482.50"
          description="Total since inception"
          icon={<CircleDollarSign className="text-accent" />}
        />
        <StatCard
          title="Next Payout"
          value="15 days"
          description="July 31, 2024"
          icon={<Calendar className="text-accent" />}
        />
        <StatCard
          title="Active Protocol"
          value="Aave v3"
          description="Current APY: 5.2%"
          icon={<Activity className="text-accent" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
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
        <Card>
          <CardHeader>
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
                    <Badge variant="outline" className="border-green-500 bg-green-900/50 text-green-400">
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
