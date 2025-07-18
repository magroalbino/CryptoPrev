'use client';
import {
  Activity,
  Wallet,
  Hourglass,
  CircleDollarSign,
  Landmark,
  ArrowDownLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DepositDialog from '@/components/dashboard/deposit-dialog';
import WithdrawDialog from '@/components/dashboard/withdraw-dialog';
import StatCard from '@/components/dashboard/stat-card';
import YieldChart from '@/components/dashboard/yield-chart';
import ProjectionChart from '@/components/dashboard/projection-chart';
import LockupDialog from '@/components/dashboard/lockup-dialog';
import { useAuth } from '@/lib/firebase-auth';
import { useEffect, useState } from 'react';
import { useAppTranslation } from '@/hooks/use-app-translation';

// Mock data, in a real app this would come from a backend/firestore
const mockData = {
  userData: {
    currentBalance: 5250.75,
    accumulatedRewards: 250.75,
    activeProtocol: 'Compound',
    activeProtocolApy: 5.2,
    lockupPeriod: 12,
  },
  transactions: [
    { id: '1', date: 'June 30, 2024', amount: 45.5, status: 'Paid', protocol: 'Aave', type: 'Yield' },
    { id: '6', date: 'June 1, 2024', amount: 1000, status: 'Completed', protocol: 'N/A', type: 'Deposit' },
    { id: '2', date: 'May 31, 2024', amount: 42.1, status: 'Paid', protocol: 'Aave', type: 'Yield' },
    { id: '3', date: 'April 30, 2024', amount: 48.9, status: 'Paid', protocol: 'Compound', type: 'Yield' },
    { id: '7', date: 'April 15, 2024', amount: 500, status: 'Completed', protocol: 'N/A', type: 'Deposit' },
    { id: '4', date: 'March 31, 2024', amount: 39.2, status: 'Paid', protocol: 'Compound', type: 'Yield' },
    { id: '5', date: 'February 29, 2024', amount: 41.8, status: 'Paid', protocol: 'Compound', type: 'Yield' },
  ],
};

export default function Dashboard() {
  const { web3UserAddress, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState(mockData);
  const { t } = useAppTranslation();

  // In a real app, you would fetch user-specific data here based on web3UserAddress
  useEffect(() => {
    if (web3UserAddress) {
      // fetch data for this user
      setDashboardData(mockData);
    }
  }, [web3UserAddress]);

  const { userData, transactions } = dashboardData;
  const initialInvestment = userData.currentBalance - userData.accumulatedRewards;
  
  const distributionHistory = transactions.filter(t => t.type === 'Yield');
  const depositHistory = transactions.filter(t => t.type === 'Deposit');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (!web3UserAddress) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t('dashboard.connectWalletPrompt.title')}</h2>
          <p className="text-muted-foreground">{t('dashboard.connectWalletPrompt.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <div className="flex items-center space-x-2">
          <WithdrawDialog />
          <DepositDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.cards.balance.title')}
          value={`$${Number(userData.currentBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          description={t('dashboard.cards.balance.description')}
          icon={<Wallet className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.rewards.title')}
          value={`$${Number(userData.accumulatedRewards).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          description={t('dashboard.cards.rewards.description')}
          icon={<CircleDollarSign className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.lockup.title')}
          value={t('dashboard.cards.lockup.value', { count: userData.lockupPeriod })}
          description={t('dashboard.cards.lockup.description')}
          icon={<Hourglass className="text-accent" />}
          action={<LockupDialog currentPeriod={userData.lockupPeriod} />}
        />
        <StatCard
          title={t('dashboard.cards.protocol.title')}
          value={userData.activeProtocol}
          description={t('dashboard.cards.protocol.description', { apy: userData.activeProtocolApy })}
          icon={<Activity className="text-accent" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.charts.yield.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.charts.yield.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <YieldChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.charts.growth.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.charts.growth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectionChart initialInvestment={initialInvestment} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.history.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.history.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="yield">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="yield">{t('dashboard.history.yieldTab')}</TabsTrigger>
                <TabsTrigger value="deposits">{t('dashboard.history.depositsTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="yield">
                <Table>
                    <TableHeader>
                    <TableRow className='hover:bg-card'>
                        <TableHead>{t('dashboard.history.table.date')}</TableHead>
                        <TableHead>{t('dashboard.history.table.protocol')}</TableHead>
                        <TableHead className="text-right">{t('dashboard.history.table.amount')}</TableHead>
                        <TableHead className="text-center">{t('dashboard.history.table.status')}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {distributionHistory.map((dist) => (
                        <TableRow key={dist.id} className='hover:bg-muted/50'>
                        <TableCell>
                            <div className="font-bold">{dist.date}</div>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>{dist.protocol}</TableCell>
                        <TableCell className="text-right font-mono font-bold">${dist.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant="outline" className="border-accent bg-accent/20 text-accent-foreground brutalist-border">
                            {t(`dashboard.history.statusLabels.${dist.status.toLowerCase()}` as any)}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TabsContent>
            <TabsContent value="deposits">
                 <Table>
                    <TableHeader>
                    <TableRow className='hover:bg-card'>
                        <TableHead>{t('dashboard.history.table.date')}</TableHead>
                        <TableHead className="text-right">{t('dashboard.history.table.amount')}</TableHead>
                        <TableHead className="text-center">{t('dashboard.history.table.status')}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {depositHistory.map((deposit) => (
                        <TableRow key={deposit.id} className='hover:bg-muted/50'>
                        <TableCell>
                            <div className="font-bold">{deposit.date}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">${deposit.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                             <Badge variant="outline" className="border-green-500 bg-green-500/20 text-foreground brutalist-border">
                                {t(`dashboard.history.statusLabels.${deposit.status.toLowerCase()}` as any)}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TabsContent>
           </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
