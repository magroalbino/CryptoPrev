
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
import { Label } from '@/components/ui/label';
import { Edit2, Zap, Calendar, Shield, Telescope, Goal } from 'lucide-react';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { cn } from '@/lib/utils';
import { getDynamicApy } from '@/lib/apy';


export default function LockupDialog({ currentPeriod, onUpdate }: { currentPeriod: number, onUpdate: (period: number) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(String(currentPeriod));
  const { t } = useAppTranslation();

  const plans = [
    { value: "3", title: t('lockup.plans.flexible.title'), description: t('lockup.plans.flexible.description'), icon: <Zap/> },
    { value: "6", title: t('lockup.plans.strategic.title'), description: t('lockup.plans.strategic.description'), icon: <Calendar/> },
    { value: "12", title: t('lockup.plans.committed.title'), description: t('lockup.plans.committed.description'), icon: <Shield/> },
    { value: "36", title: t('lockup.plans.visionary.title'), description: t('lockup.plans.visionary.description'), icon: <Telescope/> },
    { value: "60", title: t('lockup.plans.retirement.title'), description: t('lockup.plans.retirement.description'), icon: <Goal/> },
  ].map(plan => ({
    ...plan,
    apy: getDynamicApy(Number(plan.value))
  }));

  const handleUpdate = () => {
    const newPeriod = Number(selectedPeriod);
    onUpdate(newPeriod);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 border-0 shadow-none">
          <Edit2 className="h-4 w-4 text-muted-foreground"/>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('lockup.title')}</DialogTitle>
          <DialogDescription>
            {t('lockup.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <RadioGroup
              defaultValue={selectedPeriod}
              onValueChange={setSelectedPeriod}
              className="grid grid-cols-1 gap-4 md:grid-cols-5"
            >
              {plans.map((plan) => (
                <div key={plan.value}>
                  <RadioGroupItem value={plan.value} id={`r-${plan.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`r-${plan.value}`}
                    className={cn(
                        "flex h-full flex-col justify-between rounded-md border-2 border-muted bg-popover p-4 transition-all",
                        "hover:bg-accent hover:text-accent-foreground hover:shadow-lg",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-xl"
                    )}
                  >
                    <div className="mb-4 text-center">
                        <div className="mb-2 flex justify-center">{plan.icon}</div>
                        <p className="font-bold text-lg">{plan.title}</p>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="mt-auto text-center">
                        <p className="text-xs font-bold uppercase">{t('lockup.plans.apy')}</p>
                        <p className="text-xl font-bold text-accent">{(plan.apy * 100).toFixed(1)}%</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleUpdate} className="w-full">
            {t('lockup.updateButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
