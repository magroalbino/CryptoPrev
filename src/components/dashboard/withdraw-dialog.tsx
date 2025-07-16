
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

export default function WithdrawDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = () => {
    toast({
      title: 'Withdrawal Initiated',
      description: 'Your funds are being processed and will be sent to your wallet.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowDownLeft className="mr-2 h-4 w-4" /> Withdraw Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to withdraw to your connected wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount-withdraw">Amount (USDC)</Label>
                <Input id="amount-withdraw" type="number" placeholder="1000.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="wallet-address">Wallet Address</Label>
                <Input id="wallet-address" defaultValue="0x...A1B2 (Connected)" readOnly />
                <p className="text-xs text-muted-foreground">Funds will be sent to your connected wallet.</p>
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleWithdraw} className="w-full">
            Confirm Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
