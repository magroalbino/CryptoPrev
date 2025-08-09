
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { Landmark, Users } from 'lucide-react';
import BitcoinIcon from '@/components/icons/bitcoin';


export default function ProofOfFundsPage() {
  const { t } = useAppTranslation();

  // These values would be fetched from a reliable source in a real application.
  const totalReserves = 0;
  const activeUsers = 1;
  const btcReserves = 0; // Example BTC reserves for the whole platform
  const MOCK_BTC_PRICE = 65000;
  const btcReserveValue = btcReserves * MOCK_BTC_PRICE;


  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('proofOfFunds.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('proofOfFunds.description')}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="brutalist-shadow">
            <CardHeader className='pb-4'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-secondary/50 border-2 border-foreground'>
                        <Landmark className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className='text-xl'>{t('proofOfFunds.totalReserves')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className='text-5xl font-bold text-primary'>${totalReserves.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className='text-sm text-muted-foreground'>{t('proofOfFunds.reservesDescription')}</p>
            </CardContent>
        </Card>
        <Card className="brutalist-shadow">
            <CardHeader className='pb-4'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-secondary/50 border-2 border-foreground'>
                        <BitcoinIcon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className='text-xl'>{t('proofOfFunds.btcReserves')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className='text-5xl font-bold text-primary'>${btcReserveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className='text-sm text-muted-foreground'>{btcReserves.toFixed(4)} BTC</p>
            </CardContent>
        </Card>
         <Card className="brutalist-shadow">
            <CardHeader className='pb-4'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-secondary/50 border-2 border-foreground'>
                        <Users className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className='text-xl'>{t('proofOfFunds.activeUsers')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className='text-5xl font-bold text-primary'>{activeUsers.toLocaleString('en-US')}</p>
                <p className='text-sm text-muted-foreground'>{t('proofOfFunds.usersDescription')}</p>
            </CardContent>
        </Card>
      </div>
      <Card className="bg-card">
        <CardHeader>
            <CardTitle>{t('proofOfFunds.onChain.title')}</CardTitle>
            <CardDescription>{t('proofOfFunds.onChain.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
            <div className='p-4 border rounded-md font-mono text-sm bg-secondary/30'>
                <p className='font-bold text-primary'>Main Treasury Wallet (Ethereum):</p>
                <a href="#" className='text-accent hover:underline break-all'>0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</a>
            </div>
            <div className='p-4 border rounded-md font-mono text-sm bg-secondary/30'>
                <p className='font-bold text-primary'>Yield Farming Vault (Solana):</p>
                <a href="#" className="text-accent hover:underline break-all">So11111111111111111111111111111111111111112</a>
            </div>
             <div className='p-4 border rounded-md font-mono text-sm bg-secondary/30'>
                <p className='font-bold text-primary'>Bitcoin Reserve Wallet (BTC):</p>
                <a href="#" className='text-accent hover:underline break-all'>bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq</a>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
