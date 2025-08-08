
'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowDownLeft, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useAuth } from '@/lib/firebase-auth';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface WithdrawDialogProps {
    currentBalance: number;
    lockupPeriod: number;
}

export default function WithdrawDialog({ currentBalance, lockupPeriod }: WithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const { t } = useAppTranslation();
  const { web3UserAddress } = useAuth();
  
  // A simple check if there's any active lock-up period. 
  // In a real scenario, this would involve checking dates.
  const isLocked = lockupPeriod > 0;

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        toast({ variant: 'destructive', title: t('withdraw.toast.error.title'), description: t('withdraw.toast.error.invalidAmount') });
        return;
    }
    
    if (withdrawAmount > currentBalance) {
        toast({ variant: 'destructive', title: t('withdraw.toast.error.title'), description: t('withdraw.toast.error.insufficientBalance') });
        return;
    }

    if (isLocked) {
        toast({ variant: 'destructive', title: t('withdraw.toast.error.title'), description: t('withdraw.toast.error.fundsLocked') });
        return;
    }

    toast({
      title: t('withdraw.toast.success.title'),
      description: t('withdraw.toast.success.description', { amount: withdrawAmount.toFixed(2) }),
    });
    setOpen(false);
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowDownLeft className="mr-2 h-4 w-4" /> {t('withdraw.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('withdraw.title')}</DialogTitle>
          <DialogDescription>
            {t('withdraw.description')}
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
            <Alert variant="destructive" className="border-amber-500/50 text-amber-500 bg-amber-500/10 [&>svg]:text-amber-500">
                <Lock className="h-4 w-4" />
                <AlertTitle>{t('withdraw.locked.title')}</AlertTitle>
                <AlertDescription>
                    {t('withdraw.locked.description', { count: lockupPeriod })}
                </AlertDescription>
            </Alert>
        ) : (
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="amount-withdraw">{t('withdraw.amountLabel')}</Label>
                     <div className="relative">
                        <Input 
                            id="amount-withdraw" 
                            type="number" 
                            placeholder="1000.00" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLocked}
                            className="pr-12"
                        />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7" 
                            onClick={() => setAmount(String(currentBalance))}
                            disabled={isLocked}
                        >
                            Max
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('withdraw.availableBalance')}: ${currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wallet-address">{t('withdraw.addressLabel')}</Label>
                    <Input id="wallet-address" value={web3UserAddress ? `${web3UserAddress.substring(0, 10)}... (Connected)` : t('withdraw.notConnected')} readOnly />
                    <p className="text-xs text-muted-foreground">{t('withdraw.addressDescription')}</p>
                </div>
            </div>
        )}
        
        <DialogFooter>
          <Button type="submit" onClick={handleWithdraw} className="w-full" disabled={isLocked}>
            {t('withdraw.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
