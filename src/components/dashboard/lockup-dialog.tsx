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
import { useToast } from '@/hooks/use-toast';
import { Edit2, Zap, Calendar, Shield } from 'lucide-react';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { cn } from '@/lib/utils';


export default function LockupDialog({ currentPeriod }: { currentPeriod: number }) {
  const [open, setOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(String(currentPeriod));
  const { toast } = useToast();
  const { t } = useAppTranslation();

  const plans = [
    { value: "3", title: t('lockup.plans.short.title'), description: t('lockup.plans.short.description'), apy: "5.5%", icon: <Zap/> },
    { value: "6", title: t('lockup.plans.medium.title'), description: t('lockup.plans.medium.description'), apy: "7.0%", icon: <Calendar/> },
    { value: "12", title: t('lockup.plans.long.title'), description: t('lockup.plans.long.description'), apy: "8.5%", icon: <Shield/> },
  ];

  const handleUpdate = () => {
    // In a real app, this would update the user's settings in Firestore
    console.log("Updating lock-up period to:", selectedPeriod);
    toast({
      title: t('lockup.toast.success.title'),
      description: t('lockup.toast.success.description', { count: Number(selectedPeriod) }),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 border-0 shadow-none">
          <Edit2 className="h-4 w-4 text-muted-foreground"/>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
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
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {plans.map((plan) => (
                <div key={plan.value}>
                  <RadioGroupItem value={plan.value} id={`r-${plan.value}`} className="peer sr-only" />
                  <Label
                    htmlFor={`r-${plan.value}`}
                    className={cn(
                        "flex h-full flex-col justify-between rounded-md border-2 border-muted bg-popover p-4",
                        "hover:bg-accent hover:text-accent-foreground",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg"
                    )}
                  >
                    <div className="mb-4 text-center">
                        <div className="mb-2 flex justify-center">{plan.icon}</div>
                        <p className="font-bold text-lg">{plan.title}</p>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="mt-auto text-center">
                        <p className="text-xs font-bold uppercase">{t('lockup.plans.apy')}</p>
                        <p className="text-xl font-bold text-accent">{plan.apy}</p>
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
