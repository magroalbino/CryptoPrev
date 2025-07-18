
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
import { ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useAuth } from '@/lib/firebase-auth';

export default function WithdrawDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useAppTranslation();
  const { web3UserAddress } = useAuth();


  const handleWithdraw = () => {
    toast({
      title: t('withdraw.toast.success.title'),
      description: t('withdraw.toast.success.description'),
    });
    setOpen(false);
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
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount-withdraw">{t('withdraw.amountLabel')}</Label>
                <Input id="amount-withdraw" type="number" placeholder="1000.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="wallet-address">{t('withdraw.addressLabel')}</Label>
                <Input id="wallet-address" value={web3UserAddress ? `${web3UserAddress.substring(0, 10)}... (Connected)` : t('withdraw.notConnected')} readOnly />
                <p className="text-xs text-muted-foreground">{t('withdraw.addressDescription')}</p>
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleWithdraw} className="w-full">
            {t('withdraw.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
