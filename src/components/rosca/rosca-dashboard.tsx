// src/components/rosca/rosca-dashboard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/firebase-auth';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { Handshake, Users, CircleDollarSign, BarChart, TrendingUp, Shuffle, Bot, Recycle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import StatCard from '../dashboard/stat-card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Alice', status: 'paid', received: true, order: 1 },
  { id: '2', name: 'Beto', status: 'paid', received: true, order: 2 },
  { id: '3', name: 'Carla', status: 'paid', received: false, order: 3 },
  { id: '4', name: 'Daniel (Você)', status: 'paid', received: false, order: 4 },
  { id: '5', name: 'Elisa', status: 'waiting', received: false, order: 5 },
  { id: '6', name: 'Fernando', status: 'waiting', received: false, order: 6 },
  { id: '7', name: 'Gabriela', status: 'waiting', received: false, order: 7 },
  { id: '8', name: 'Heitor', status: 'waiting', received: false, order: 8 },
  { id: '9', name: 'Isabela', status: 'waiting', received: false, order: 9 },
  { id: '10', name: 'Jorge', status: 'waiting', received: false, order: 10 },
  { id: '11', name: 'Larissa', status: 'waiting', received: false, order: 11 },
  { id: '12', name: 'Marcos', status: 'waiting', received: false, order: 12 },
];

const MOCK_PERFORMANCE_DATA = [
    { month: 'Jan', yield: 0.5 }, { month: 'Fev', yield: 0.7 },
    { month: 'Mar', yield: 1.1 }, { month: 'Abr', yield: 1.5 },
];

const CONTRIBUTION_AMOUNT = 500;
const TOTAL_POT = CONTRIBUTION_AMOUNT * MOCK_PARTICIPANTS.length;

export default function RoscaDashboard() {
  const { web3UserAddress } = useAuth();
  const { t } = useAppTranslation();
  const { toast } = useToast();
  const [reallocate, setReallocate] = useState(false);
  const [bonusYield, setBonusYield] = useState(0);

  const handleContribute = () => {
    toast({
      title: t('rosca.toast.contribution.title'),
      description: t('rosca.toast.contribution.description', { amount: CONTRIBUTION_AMOUNT }),
    });
  };

  const handleReallocateToggle = (checked: boolean) => {
    setReallocate(checked);
    setBonusYield(checked ? 2.5 : 0); // Simulate 2.5% bonus yield
    toast({
        title: checked ? t('rosca.toast.reallocateOn.title') : t('rosca.toast.reallocateOff.title'),
        description: checked ? t('rosca.toast.reallocateOn.description') : t('rosca.toast.reallocateOff.description'),
    });
  }

  const currentMonth = MOCK_PARTICIPANTS.filter(p => p.received).length + 1;
  const nextRecipient = MOCK_PARTICIPANTS.find(p => p.order === currentMonth);
  const userParticipant = MOCK_PARTICIPANTS.find(p => p.name.includes('(Você)'));

  if (!web3UserAddress) {
    return (
       <div className="text-center">
            <h2 className="text-2xl font-bold">{t('dashboard.connectWalletPrompt.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('rosca.connectWalletPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                 <StatCard
                    title={t('rosca.cards.pot.title')}
                    value={`$${TOTAL_POT.toLocaleString('en-US')}`}
                    description={t('rosca.cards.pot.description')}
                    icon={<CircleDollarSign className="text-accent" />}
                />
                 <StatCard
                    title={t('rosca.cards.next.title')}
                    value={nextRecipient?.name || 'N/A'}
                    description={t('rosca.cards.next.description', { month: currentMonth, total: MOCK_PARTICIPANTS.length })}
                    icon={<Shuffle className="text-accent" />}
                />
                 <StatCard
                    title={t('rosca.cards.extraYield.title')}
                    value={`${MOCK_PERFORMANCE_DATA[MOCK_PERFORMANCE_DATA.length - 1].yield.toFixed(2)}%`}
                    description={t('rosca.cards.extraYield.description')}
                    icon={<TrendingUp className="text-accent" />}
                />
            </div>
             <Card className="brutalist-shadow">
                <CardHeader>
                    <CardTitle>{t('rosca.participants.title')}</CardTitle>
                    <CardDescription>{t('rosca.participants.description_cycle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('rosca.participants.table.order')}</TableHead>
                                <TableHead>{t('rosca.participants.table.name')}</TableHead>
                                <TableHead className="text-center">{t('rosca.participants.table.contribution')}</TableHead>
                                <TableHead className="text-center">{t('rosca.participants.table.received')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_PARTICIPANTS.map((p) => (
                            <TableRow key={p.id} className={p.name.includes('(Você)') ? 'bg-accent/10' : ''}>
                                <TableCell className="font-bold text-lg">{p.order}</TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={p.status === 'paid' ? 'default' : 'secondary'} className={p.status === 'paid' ? 'bg-green-500/80' : ''}>
                                        {t(`rosca.participants.status.${p.status}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    {p.received ? '✅' : '⏳'}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card className="brutalist-shadow">
                 <CardHeader>
                    <CardTitle>{t('rosca.actions.title')}</CardTitle>
                    <CardDescription>{t('rosca.actions.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleContribute} className="w-full" size="lg">
                        <Handshake className="mr-2"/> {t('rosca.actions.contributeButton', { amount: CONTRIBUTION_AMOUNT })}
                    </Button>
                    <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reallocate-switch" className="flex flex-col space-y-1">
                                <span className="font-bold flex items-center gap-2"><Recycle/> {t('rosca.reallocate.title')}</span>
                                <span className="font-normal text-muted-foreground text-xs">{t('rosca.reallocate.description')}</span>
                            </Label>
                            <Switch id="reallocate-switch" onCheckedChange={handleReallocateToggle} checked={reallocate}/>
                        </div>

                        {reallocate && (
                             <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">{t('rosca.reallocate.bonusYield')}</p>
                                <p className="text-2xl font-bold text-accent">+{bonusYield}% APY</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="brutalist-shadow">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> {t('rosca.investment.title')}</CardTitle>
                    <CardDescription>{t('rosca.investment.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[150px] w-full">
                        <AreaChart data={MOCK_PERFORMANCE_DATA} margin={{ left: 0, right: 10, top: 5, bottom: 0}}>
                            <defs>
                                <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                             <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)"/>
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickFormatter={(val) => `${val}%`} tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                            <Tooltip 
                                cursor={{fill: 'hsl(var(--accent) / 0.1)'}}
                                content={<ChartTooltipContent formatter={(value) => `${(value as number).toFixed(2)}%`} indicator='line'/>}
                            />
                            <Area dataKey="yield" type="monotone" fill="url(#fillYield)" stroke="hsl(var(--accent))" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
