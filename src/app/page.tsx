
'use client';
import {
  Activity,
  Wallet,
  Hourglass,
  CircleDollarSign,
  Trophy,
  History,
  Sparkles,
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getDynamicApy } from '@/lib/apy';
import BitcoinIcon from '@/components/icons/bitcoin';


type ActiveStrategy = {
  name: string;
  apy: number;
}

const MOCK_BTC_PRICE = 65000; // Mock BTC price for simulation

export default function Dashboard() {
  const { web3UserAddress, usdcBalance, loading, walletType, connectWallet } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { t } = useAppTranslation();
  const { toast } = useToast();

  const handleDeposit = (amount: number) => {
    // In a real app, this would be handled server-side after a real transaction.
    // This is a simulation.
    if (!dashboardData) return;

    const btcAllocation = amount * 0.15; // 15% to BTC reserve
    const stablecoinAllocation = amount * 0.85; // 85% to yield strategies

    const btcAmount = btcAllocation / MOCK_BTC_PRICE;

    setDashboardData((prevData: any) => {
        const newBalance = prevData.userData.currentBalance + stablecoinAllocation;
        const newBtcReserve = (prevData.userData.bitcoinReserve || 0) + btcAmount;
        const newApy = getDynamicApy(prevData.userData.lockupPeriod);
        const newAccumulatedRewards = newBalance * newApy;
        const newMonthlyYield = newAccumulatedRewards / 12;

        return {
            ...prevData,
            userData: {
                ...prevData.userData,
                currentBalance: newBalance,
                bitcoinReserve: newBtcReserve,
                accumulatedRewards: newAccumulatedRewards,
                monthlyYield: newMonthlyYield,
            }
        };
    });

    toast({
      title: t('deposit.toast.success.title'),
      description: t('deposit.toast.success.description'),
    });
  }

  const generateDashboardData = (address: string, usdcBalanceValue: number | null, activeStrategy: ActiveStrategy | null) => {
      const currentBalance = usdcBalanceValue !== null && usdcBalanceValue >= 0 
        ? usdcBalanceValue 
        : 0;
      
      const lockupPeriod = 12; // Default lockup period
      const defaultApy = getDynamicApy(lockupPeriod);
      const defaultStrategyName = t('dashboard.cards.protocol.defaultStrategy');

      const finalStrategy = activeStrategy || { name: defaultStrategyName, apy: defaultApy };

      const accumulatedRewards = currentBalance * finalStrategy.apy;
      const monthlyYield = accumulatedRewards / 12;
      
      const transactions: any[] = [];
      const achievements: any[] = [
        { id: 'ach1', name: 'Ant', icon: '🐜', achieved: false },
        { id: 'ach2', name: 'Turtle', icon: '🐢', achieved: false },
        { id: 'ach3', name: 'Elephant', icon: '🐘', achieved: false },
        { id: 'ach4', name: 'Eagle', icon: '🦅', achieved: false },
      ];

      return {
          userData: {
              currentBalance,
              bitcoinReserve: 0,
              accumulatedRewards,
              monthlyYield,
              activeProtocol: finalStrategy.name,
              activeProtocolApy: finalStrategy.apy,
              lockupPeriod,
          },
          transactions,
          achievements,
      };
  };

  useEffect(() => {
    if (web3UserAddress) {
      // Check localStorage for a selected strategy from the Oracle
      const storedStrategy = localStorage.getItem('selectedStrategy');
      const activeStrategy = storedStrategy ? JSON.parse(storedStrategy) : null;

      const data = generateDashboardData(web3UserAddress, usdcBalance, activeStrategy);
      setDashboardData(data);
    } else {
      setDashboardData(null);
    }
  }, [web3UserAddress, usdcBalance, t]); 

  const handleClaimYield = () => {
    if (!dashboardData) return;
    toast({
      title: t('dashboard.rewards.claimToast.title'),
      description: t('dashboard.rewards.claimToast.description', { amount: dashboardData.userData.monthlyYield.toFixed(2) }),
    });
  };

  const handleUpdateLockupPeriod = (newPeriod: number) => {
    if (!dashboardData) return;
    
    // When a user updates the lock-up, revert to the default CryptoPrev strategy
    localStorage.removeItem('selectedStrategy');
    
    const newApy = getDynamicApy(newPeriod);
    const newAccumulatedRewards = dashboardData.userData.currentBalance * newApy;
    const newMonthlyYield = newAccumulatedRewards / 12;

    setDashboardData({
        ...dashboardData,
        userData: {
            ...dashboardData.userData,
            lockupPeriod: newPeriod,
            activeProtocol: t('dashboard.cards.protocol.defaultStrategy'),
            activeProtocolApy: newApy,
            accumulatedRewards: newAccumulatedRewards,
            monthlyYield: newMonthlyYield,
        }
    });
  };
  
  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-1 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!web3UserAddress || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.connectWalletPrompt.title')}</h2>
          <p className="text-muted-foreground mt-2 mb-6">{t('dashboard.connectWalletPrompt.description')}</p>
          <Button onClick={() => connectWallet('solana')} size="lg">
            <Wallet className="mr-2" />
            {t('header.connectWallet')}
          </Button>
        </div>
      </div>
    );
  }
  
  const yieldTransactions = dashboardData.transactions.filter((tx: any) => tx.type === 'Yield');
  const depositTransactions = dashboardData.transactions.filter((tx: any) => tx.type === 'Deposit');

  const btcReserveValue = (dashboardData.userData.bitcoinReserve || 0) * MOCK_BTC_PRICE;

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <div className="flex items-center space-x-2">
          <WithdrawDialog currentBalance={dashboardData.userData.currentBalance} lockupPeriod={dashboardData.userData.lockupPeriod} />
          <DepositDialog onDeposit={handleDeposit} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.cards.balance.title')}
          value={walletType === 'solana' ? `$${Number(dashboardData.userData.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : t('dashboard.cards.balance.notApplicable')}
          description={walletType === 'solana' ? t('dashboard.cards.balance.description') : t('dashboard.cards.balance.notApplicableDescription')}
          icon={<Wallet className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.rewards.title')}
          value={`$${Number(dashboardData.userData.accumulatedRewards).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={t('dashboard.cards.rewards.description')}
          icon={<CircleDollarSign className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.btcReserve.title')}
          value={`${(dashboardData.userData.bitcoinReserve || 0).toFixed(6)} BTC`}
          subtitle={`≈ $${btcReserveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={t('dashboard.cards.btcReserve.description')}
          icon={<BitcoinIcon className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.lockup.title')}
          value={t('dashboard.cards.lockup.value_other', { count: dashboardData.userData.lockupPeriod })}
          description={t('dashboard.cards.lockup.description')}
          icon={<Hourglass className="text-accent" />}
          action={<LockupDialog currentPeriod={dashboardData.userData.lockupPeriod} onUpdate={handleUpdateLockupPeriod} />}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 space-y-6">
          <Card className="brutalist-shadow">
            <CardHeader>
              <CardTitle>{t('dashboard.rewards.title')}</CardTitle>
              <CardDescription>{t('dashboard.rewards.description')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-accent">${dashboardData.userData.monthlyYield.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.rewards.available')}</p>
            </CardContent>
            <CardContent>
              <Button onClick={handleClaimYield} className="w-full">{t('dashboard.rewards.claimButton')}</Button>
            </CardContent>
          </Card>
          <Card className="brutalist-shadow">
            <CardHeader>
              <CardTitle>{t('dashboard.achievements.title')}</CardTitle>
              <CardDescription>{t('dashboard.achievements.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {dashboardData.achievements.length > 0 ? (
                    <TooltipProvider>
                        <div className="flex flex-wrap justify-center gap-4">
                        {dashboardData.achievements.map((ach: any) => (
                            <Tooltip key={ach.id}>
                            <TooltipTrigger asChild>
                                <div className={cn('relative rounded-md border-2 p-3 transition-all duration-300', ach.achieved ? 'border-accent bg-accent/20' : 'border-muted bg-muted/50 opacity-50')}>
                                <span className={cn('text-2xl', ach.achieved ? '' : 'grayscale')}>{ach.icon}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{t(`dashboard.achievements.items.${ach.name.toLowerCase()}.name`)}</p>
                                <p className="text-sm text-muted-foreground">{t(`dashboard.achievements.items.${ach.name.toLowerCase()}.description`)}</p>
                            </TooltipContent>
                            </Tooltip>
                        ))}
                        </div>
                    </TooltipProvider>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                        <Trophy className="h-10 w-10 mb-4" />
                        <p className="font-bold">{t('dashboard.achievements.empty.title')}</p>
                        <p className="text-sm">{t('dashboard.achievements.empty.description')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card className="brutalist-shadow">
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
          <Card className="brutalist-shadow">
            <CardHeader>
              <CardTitle>{t('dashboard.charts.growth.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.growth.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectionChart initialInvestment={dashboardData.userData.currentBalance > 0 ? dashboardData.userData.currentBalance - dashboardData.userData.accumulatedRewards : 1} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="brutalist-shadow">
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
                {yieldTransactions.length > 0 ? (
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
                        {yieldTransactions.map((dist: any) => (
                            <TableRow key={dist.id} className='hover:bg-muted/50'>
                            <TableCell>
                                <div className="font-bold">{dist.date}</div>
                            </TableCell>
                            <TableCell className='text-muted-foreground'>{dist.protocol}</TableCell>
                            <TableCell className="text-right font-mono font-bold">${dist.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="border-accent bg-accent/20 text-accent-foreground">
                                {t(`dashboard.history.statusLabels.${dist.status.toLowerCase()}` as any)}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <Sparkles className="h-10 w-10 mb-4" />
                        <p className="font-bold">{t('dashboard.history.empty.yieldTitle')}</p>
                        <p className="text-sm">{t('dashboard.history.empty.yieldDescription')}</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="deposits">
                {depositTransactions.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow className='hover:bg-card'>
                            <TableHead>{t('dashboard.history.table.date')}</TableHead>
                            <TableHead className="text-right">{t('dashboard.history.table.amount')}</TableHead>
                            <TableHead className="text-center">{t('dashboard.history.table.status')}</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {depositTransactions.map((deposit: any) => (
                            <TableRow key={deposit.id} className='hover:bg-muted/50'>
                            <TableCell>
                                <div className="font-bold">{deposit.date}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">${deposit.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className="border-green-500 bg-green-500/20 text-foreground">
                                {t(`dashboard.history.statusLabels.${deposit.status.toLowerCase()}` as any)}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <History className="h-10 w-10 mb-4" />
                        <p className="font-bold">{t('dashboard.history.empty.depositTitle')}</p>
                        <p className="text-sm">{t('dashboard.history.empty.depositDescription')}</p>
                    </div>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
