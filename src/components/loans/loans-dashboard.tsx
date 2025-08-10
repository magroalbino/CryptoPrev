
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase-auth';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { HandCoins, PiggyBank, Percent, Landmark, Wallet, Calculator } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import StatCard from '../dashboard/stat-card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getDynamicInterestRate, MOCK_TVL } from '@/lib/apy';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function LoansDashboard() {
  const { web3UserAddress, usdcBalance, loading, connectWallet } = useAuth();
  const [loansData, setLoansData] = useState<any>({
    activeLoans: [],
  });
  const [loanAmount, setLoanAmount] = useState('1000');
  const [loanTerm, setLoanTerm] = useState(12); // Default 12 months
  const [simulation, setSimulation] = useState({ monthlyPayment: 0, totalInterest: 0 });

  const { t } = useAppTranslation();
  const { toast } = useToast();

  const collateralValue = usdcBalance || 0;
  const availableToBorrow = collateralValue * 0.5; // 50% LTV
  const interestRate = getDynamicInterestRate(MOCK_TVL);

  useEffect(() => {
    const amount = parseFloat(loanAmount);
    if (isNaN(amount) || amount <= 0 || loanTerm <= 0) {
      setSimulation({ monthlyPayment: 0, totalInterest: 0 });
      return;
    }

    const monthlyInterestRate = interestRate / 12;
    const monthlyPayment = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
    const totalPayment = monthlyPayment * loanTerm;
    const totalInterest = totalPayment - amount;

    setSimulation({
      monthlyPayment: monthlyPayment,
      totalInterest: totalInterest,
    });
  }, [loanAmount, loanTerm, interestRate]);

  const handleRequestLoan = () => {
    const amount = parseFloat(loanAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    if (amount > availableToBorrow) {
      toast({
        variant: 'destructive',
        title: t('loans.toast.error.title'),
        description: t('loans.toast.error.insufficientCollateral'),
      });
      return;
    }

    const newLoan = {
      id: `loan-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      amount: amount,
      interestRate: interestRate,
      status: 'Active',
    };

    setLoansData({
        ...loansData,
        activeLoans: [newLoan, ...loansData.activeLoans]
    });

    toast({
      title: t('loans.toast.success.title'),
      description: t('loans.toast.success.description', { amount: amount.toFixed(2) }),
    });

    setLoanAmount('');
  };

  const RequestLoanButton = () => {
    if (!web3UserAddress) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" size="lg">{t('loans.request.button')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dashboard.connectWalletPrompt.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('loans.connectWalletPrompt.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('loans.connectWalletPrompt.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => connectWallet('solana')}>
                <Wallet className="mr-2"/>{t('header.connectWallet')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <Button onClick={handleRequestLoan} className="w-full" size="lg">
        {t('loans.request.button')}
      </Button>
    );
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                 <StatCard
                    title={t('loans.cards.collateral.title')}
                    value={`$${collateralValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('loans.cards.collateral.description')}
                    icon={<PiggyBank className="text-accent" />}
                />
                 <StatCard
                    title={t('loans.cards.available.title')}
                    value={`$${availableToBorrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('loans.cards.available.description')}
                    icon={<HandCoins className="text-accent" />}
                />
                 <StatCard
                    title={t('loans.cards.interest.title')}
                    value={`${(interestRate * 100).toFixed(1)}%`}
                    description={t('loans.cards.interest.description')}
                    icon={<Percent className="text-accent" />}
                />
            </div>
             <Card className="brutalist-shadow">
                <CardHeader>
                    <CardTitle>{t('loans.history.title')}</CardTitle>
                    <CardDescription>{t('loans.history.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                   {loansData.activeLoans.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('loans.history.table.date')}</TableHead>
                                <TableHead className="text-right">{t('loans.history.table.amount')}</TableHead>
                                <TableHead className="text-center">{t('loans.history.table.interest')}</TableHead>
                                <TableHead className="text-center">{t('loans.history.table.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loansData.activeLoans.map((loan: any) => (
                            <TableRow key={loan.id}>
                                <TableCell>{loan.date}</TableCell>
                                <TableCell className="text-right font-mono font-bold">${loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-center font-mono">{ (loan.interestRate * 100).toFixed(1)}%</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className="border-accent bg-accent/20 text-accent-foreground">
                                    {t(`loans.history.statusLabels.${loan.status.toLowerCase()}` as any)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <Landmark className="h-10 w-10 mb-4" />
                        <p className="font-bold">{t('loans.history.empty.title')}</p>
                        <p className="text-sm">{t('loans.history.empty.description')}</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card className="brutalist-shadow">
                 <CardHeader>
                    <CardTitle>{t('loans.request.title')}</CardTitle>
                    <CardDescription>{t('loans.request.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="loan-amount">{t('loans.request.amountLabel')}</Label>
                        <Input 
                            id="loan-amount" 
                            type="number" 
                            placeholder="e.g., 1000" 
                            value={loanAmount} 
                            onChange={(e) => setLoanAmount(e.target.value)} 
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="loan-term">{t('loans.simulator.termLabel', { term: loanTerm })}</Label>
                        <Slider
                            id="loan-term"
                            min={6}
                            max={36}
                            step={6}
                            value={[loanTerm]}
                            onValueChange={(value) => setLoanTerm(value[0])}
                        />
                    </div>
                    <Separator />
                    <div className="space-y-4 rounded-lg bg-secondary/30 p-4">
                        <h4 className="font-bold text-md flex items-center gap-2">
                            <Calculator className="text-accent" /> {t('loans.simulator.title')}
                        </h4>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('loans.simulator.monthlyPayment')}</span>
                            <span className="font-bold text-primary">${simulation.monthlyPayment.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('loans.simulator.totalInterest')}</span>
                            <span className="font-bold text-primary">${simulation.totalInterest.toFixed(2)}</span>
                        </div>
                    </div>
                    <RequestLoanButton />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
