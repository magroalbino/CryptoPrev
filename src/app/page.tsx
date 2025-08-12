
'use client';
import {
  Wallet,
  Hourglass,
  CircleDollarSign,
} from 'lucide-react';
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
import { useEffect, useState, useTransition } from 'react';
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
import BitcoinIcon from '@/components/icons/bitcoin';
import { handleDeposit, handleUpdateLockupPeriod, getUserData } from './dashboard/actions';
import { User } from 'firebase/auth';
import BnbIcon from '@/components/icons/bnb';


const MOCK_BTC_PRICE = 65000; // Mock BTC price for simulation
const MOCK_BNB_PRICE = 580; // Mock BNB price for simulation

export default function Dashboard() {
  const { user, web3UserAddress, loading, connectWallet, walletType } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { t } = useAppTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const loadDashboardData = async (currentUser: User) => {
    setIsDataLoading(true);
    const data = await getUserData(currentUser.uid);
    setDashboardData(data);
    setIsDataLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData(user);
    } else {
      // If there's no user, stop the data loading state.
      // The main `loading` from `useAuth` will handle the initial page load skeleton.
      setIsDataLoading(false);
      setDashboardData(null);
    }
  }, [user]);


  const onDeposit = (amount: number) => {
    if (!user) return;
    startTransition(async () => {
      const result = await handleDeposit(user.uid, amount);
      if (result.success) {
        toast({
          title: t('deposit.toast.success.title'),
          description: t('deposit.toast.success.description'),
        });
        await loadDashboardData(user); // Refresh data
      } else {
        toast({
          variant: 'destructive',
          title: 'Deposit Failed',
          description: result.error,
        });
      }
    });
  };

  const onUpdateLockupPeriod = (newPeriod: number) => {
    if (!user) return;
     startTransition(async () => {
        const result = await handleUpdateLockupPeriod(user.uid, newPeriod);
        if (result.success) {
            toast({
                title: t('lockup.toast.success.title'),
                description: t('lockup.toast.success.description', { count: newPeriod }),
            });
            await loadDashboardData(user); // Refresh data
        } else {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: result.error,
            });
        }
    });
  };

  
  const handleClaimYield = () => {
    if (!dashboardData) return;
    toast({
      title: t('dashboard.rewards.claimToast.title'),
      description: t('dashboard.rewards.claimToast.description', { amount: dashboardData.monthlyYield.toFixed(2) }),
    });
  };
  
  if (loading || isDataLoading) {
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
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !web3UserAddress || !dashboardData) {
    return (
      <div className="flex-1 flex justify-center pt-20">
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
  
  const btcReserveValue = (dashboardData.bitcoinReserve || 0) * MOCK_BTC_PRICE;
  const bnbReserveValue = (dashboardData.bnbReserve || 0) * MOCK_BNB_PRICE;

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <div className="flex items-center space-x-2">
          <WithdrawDialog currentBalance={dashboardData.currentBalance} lockupPeriod={dashboardData.lockupPeriod} />
          <DepositDialog onDeposit={onDeposit} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.cards.balance.title')}
          value={walletType === 'solana' ? `$${Number(dashboardData.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : t('dashboard.cards.balance.notApplicable')}
          description={t('dashboard.cards.balance.description')}
          icon={<Wallet className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.rewards.title')}
          value={`$${Number(dashboardData.accumulatedRewards).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={t('dashboard.cards.rewards.description')}
          icon={<CircleDollarSign className="text-accent" />}
        />
        <StatCard
          title={t('dashboard.cards.btcReserve.title')}
          value={`${(dashboardData.bitcoinReserve || 0).toFixed(6)} BTC`}
          subtitle={`≈ $${btcReserveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={t('dashboard.cards.btcReserve.description')}
          icon={<BitcoinIcon className="text-accent" />}
        />
         <StatCard
          title={t('dashboard.cards.bnbReserve.title')}
          value={`${(dashboardData.bnbReserve || 0).toFixed(4)} BNB`}
          subtitle={`≈ $${bnbReserveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={t('dashboard.cards.bnbReserve.description')}
          icon={<BnbIcon className="text-accent" />}
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
              <p className="text-4xl font-bold text-accent">${dashboardData.monthlyYield.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.rewards.available')}</p>
            </CardContent>
            <CardContent>
              <Button onClick={handleClaimYield} className="w-full">{t('dashboard.rewards.claimButton')}</Button>
            </CardContent>
          </Card>
           <StatCard
            title={t('dashboard.cards.lockup.title')}
            value={t('dashboard.cards.lockup.value_other', { count: dashboardData.lockupPeriod })}
            description={t('dashboard.cards.lockup.description')}
            icon={<Hourglass className="text-accent" />}
            action={<LockupDialog currentPeriod={dashboardData.lockupPeriod} onUpdate={onUpdateLockupPeriod} />}
          />
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
              <ProjectionChart initialInvestment={dashboardData.currentBalance > 0 ? dashboardData.currentBalance - dashboardData.accumulatedRewards : 1} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
