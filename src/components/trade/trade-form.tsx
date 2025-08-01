
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppTranslation } from '@/hooks/use-app-translation';

const MOCK_PRICES: { [key: string]: number } = {
  ETH: 3500.5,
  WBTC: 65000.75,
  USDC: 1.0,
  DAI: 1.0,
};

const TOKENS = [
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'WBTC', label: 'Wrapped Bitcoin (WBTC)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
  { value: 'DAI', label: 'Dai (DAI)' },
];

export default function TradeForm() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState(1);
  const { toast } = useToast();
  const { t } = useAppTranslation();

  const toAmount = useMemo(() => {
    const fromPrice = MOCK_PRICES[fromToken];
    const toPrice = MOCK_PRICES[toToken];
    if (!fromPrice || !toPrice) return 0;
    return (fromAmount * fromPrice) / toPrice;
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
  };

  const handleExecuteTrade = () => {
    toast({
      title: t('trade.toast.title'),
      description: t('trade.toast.description', {
        fromAmount: fromAmount,
        fromToken: fromToken,
        toAmount: toAmount.toFixed(4),
        toToken: toToken,
      }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trade.form.title')}</CardTitle>
        <CardDescription>{t('trade.form.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-md border-2 border-input p-4">
          <Label htmlFor="fromAmount">{t('trade.form.from')}</Label>
          <div className="flex gap-2">
            <Input
              id="fromAmount"
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(Number(e.target.value))}
              className="text-lg"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('trade.form.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    {token.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative flex justify-center">
            <Button variant="outline" size="icon" onClick={handleSwap} className="absolute top-[-22px] z-10 rounded-full border-4 border-background">
                <ArrowDownUp className="h-4 w-4" />
            </Button>
        </div>


        <div className="space-y-2 rounded-md border-2 border-input p-4">
          <Label htmlFor="toAmount">{t('trade.form.to')}</Label>
          <div className="flex gap-2">
            <Input id="toAmount" type="number" value={toAmount.toFixed(4)} readOnly className="text-lg bg-secondary" />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('trade.form.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    {token.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            1 {fromToken} ≈ {(MOCK_PRICES[fromToken] / MOCK_PRICES[toToken]).toFixed(4)} {toToken}
          </p>
          <p className="text-xs">{t('trade.form.rateDisclaimer')}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExecuteTrade} className="w-full" size="lg">
            <RefreshCw className='mr-2'/>
            {t('trade.form.submitButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
