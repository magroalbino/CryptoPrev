
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase-auth';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { HeartPulse, Stethoscope, Brain, Apple, FlaskConical, Wallet } from 'lucide-react';
import DepositDialog from '@/components/dashboard/deposit-dialog';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { History } from 'lucide-react';

const MOCK_SERVICES = [
  { id: '1', name: 'health.services.general.name', description: 'health.services.general.description', cost: 50, icon: <Stethoscope className="text-accent" /> },
  { id: '2', name: 'health.services.psychology.name', description: 'health.services.psychology.description', cost: 75, icon: <Brain className="text-accent" /> },
  { id: '3', name: 'health.services.nutrition.name', description: 'health.services.nutrition.description', cost: 60, icon: <Apple className="text-accent" /> },
  { id: '4', name: 'health.services.lab.name', description: 'health.services.lab.description', cost: 80, icon: <FlaskConical className="text-accent" /> },
];

export default function HealthPlanDashboard() {
  const { web3UserAddress, loading, connectWallet } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const { t } = useAppTranslation();
  const { toast } = useToast();

  const generateHealthData = (address?: string) => {
    // Start with a clean slate for new users or logged-out users
    const balance = 0;
    const transactions: any[] = [];

    return {
      balance,
      transactions,
    };
  };

  useEffect(() => {
    if (web3UserAddress) {
      setHealthData(generateHealthData(web3UserAddress));
    } else {
      // Show empty state if not connected
      setHealthData(generateHealthData());
    }
  }, [web3UserAddress, t]);


  const handleUseService = (service: any) => {
    if (!healthData || healthData.balance < service.cost) {
      toast({
        variant: 'destructive',
        title: t('health.toast.error.title'),
        description: t('health.toast.error.description'),
      });
      return;
    }

    toast({
      title: t('health.toast.success.title'),
      description: t('health.toast.success.description', { service: t(service.name) }),
    });

    // Simulate balance update
    setHealthData((prev: any) => ({
        ...prev,
        balance: prev.balance - service.cost,
        transactions: [
            {
                id: `tx-${Date.now()}`,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'}),
                description: t(service.name),
                amount: -service.cost,
                type: 'Service'
            },
            ...prev.transactions
        ]
    }));
  };

  if (loading || !healthData) {
    return <Skeleton className="h-96 w-full" />;
  }


  return (
    <div className="space-y-8">
        <Card className="brutalist-shadow">
             <CardHeader className="items-center text-center">
                <CardTitle>{t('health.balance.title')}</CardTitle>
                <div className="p-4 bg-secondary/50 border-2 border-foreground rounded-full my-2">
                    <HeartPulse className="h-10 w-10 text-accent" />
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-5xl font-bold text-primary">{healthData.balance.toFixed(2)}</p>
                <p className="text-muted-foreground">{t('health.credits')}</p>
            </CardContent>
            <CardContent>
                {web3UserAddress ? (
                     <DepositDialog onDeposit={() => {}} />
                ) : (
                    <Button onClick={() => connectWallet('solana')} className="w-full">
                        <Wallet className="mr-2"/> {t('header.connectWallet')}
                    </Button>
                )}
            </CardContent>
        </Card>

        <Card className="brutalist-shadow">
            <CardHeader>
                <CardTitle>{t('health.services.title')}</CardTitle>
                <CardDescription>{t('health.services.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_SERVICES.map((service) => (
                    <Card key={service.id} className="flex flex-col">
                        <CardHeader className="items-center text-center">
                            <div className="p-3 bg-secondary/50 border-2 border-foreground rounded-full mb-2">
                                {service.icon}
                            </div>
                            <CardTitle className="text-lg">{t(service.name as any)}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow text-center">
                            <p className="text-sm text-muted-foreground">{t(service.description as any)}</p>
                        </CardContent>
                        <CardContent className="text-center">
                            <p className="text-2xl font-bold text-accent">{service.cost} {t('health.credits')}</p>
                            <Button onClick={() => handleUseService(service)} className="mt-4 w-full" disabled={!web3UserAddress}>
                                {t('health.services.useButton')}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
        
        <Card className="brutalist-shadow">
            <CardHeader>
                <CardTitle>{t('health.history.title')}</CardTitle>
                <CardDescription>{t('health.history.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {healthData.transactions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('health.history.table.date')}</TableHead>
                                <TableHead>{t('health.history.table.description')}</TableHead>
                                <TableHead className="text-right">{t('health.history.table.amount')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {healthData.transactions.map((tx: any) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell className={`text-right font-mono font-bold ${tx.amount > 0 ? 'text-accent' : 'text-primary'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <History className="h-10 w-10 mb-4" />
                        <p className="font-bold">{t('health.history.empty.title')}</p>
                        <p className="text-sm">{t('health.history.empty.description')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
