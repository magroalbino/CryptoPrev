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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Landmark } from 'lucide-react';
import { useState } from 'react';

export default function DepositDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    toast({
      title: 'Deposit Successful',
      description: 'Your USDC has been deposited and is being put to work.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Landmark className="mr-2 h-4 w-4" /> Deposit Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Stablecoins</DialogTitle>
          <DialogDescription>
            Add funds to your CryptoPrev account. They will be automatically
            allocated to the highest-yield protocols.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stablecoin" className="text-right">
              Coin
            </Label>
            <Select defaultValue="usdc">
              <SelectTrigger id="stablecoin" className="col-span-3">
                <SelectValue placeholder="Select stablecoin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="usdt" disabled>
                  USDT (coming soon)
                </SelectItem>
                <SelectItem value="dai" disabled>
                  DAI (coming soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              defaultValue="1000"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleDeposit} className="w-full">
            Confirm Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
