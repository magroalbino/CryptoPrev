
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Wallet, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const PixIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.0002 6.85718L7.71452 11.1429C7.52737 11.3301 7.42285 11.5858 7.42285 11.8516V16.1429C7.42285 16.5742 7.59014 16.9881 7.88299 17.281C8.17585 17.5738 8.58972 17.7411 9.02102 17.7411H9.59952C9.86534 17.7411 10.121 17.6366 10.3082 17.4495L12.0002 15.7572L14.8573 12.8943L16.2859 11.4572M12.0002 6.85718L13.7145 8.57147L15.4288 10.2858M12.0002 6.85718C12.5525 6.30491 13.2982 6 14.0859 6H14.9788C15.8078 6 16.6022 6.32843 17.198 6.92421C17.7938 7.52 18.1222 8.31435 18.1222 9.14335V10.0362C18.1222 10.8239 17.8173 11.5697 17.265 12.1219L16.2859 13.1029M16.2859 11.4572L15.4288 12.2858M16.2859 11.4572C15.7336 10.9049 14.9879 10.5714 14.1995 10.5714H13.7145M9.02102 6.2589C8.42523 6.85468 8.1222 7.64903 8.1222 8.47804V10.0362C8.1222 10.5422 8.27371 11.033 8.55394 11.4429L9.59952 13.1429L10.8859 11.8572L13.7145 9.00004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

export default function DepositDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    toast({
      title: 'Deposit Successful',
      description: 'Your funds have been received and are being put to work.',
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Choose your preferred method to add funds to your CryptoPrev account.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="pix" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pix"><PixIcon className="mr-2"/> PIX</TabsTrigger>
            <TabsTrigger value="card"><CreditCard className="mr-2"/> Card</TabsTrigger>
            <TabsTrigger value="crypto"><Wallet className="mr-2"/> Crypto</TabsTrigger>
          </TabsList>
          <TabsContent value="pix">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">Scan the QR code with your bank's app to pay.</p>
                <div className="rounded-md border-2 border-dashed border-muted-foreground/50 p-2">
                    <Image src="https://placehold.co/200x200.png" alt="PIX QR Code" width={200} height={200} data-ai-hint="qr code"/>
                </div>
                <p className="text-xs text-muted-foreground">This is a simulated transaction.</p>
            </div>
          </TabsContent>
          <TabsContent value="card">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expires</Label>
                  <Input id="expiry-date" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="amount-card">Amount ($)</Label>
                  <Input id="amount-card" type="number" defaultValue="1000" />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="crypto">
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
                <Label htmlFor="amount-crypto" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount-crypto"
                  type="number"
                  defaultValue="1000"
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="submit" onClick={handleDeposit} className="w-full">
            Confirm Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
