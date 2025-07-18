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
import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppTranslation } from '@/hooks/use-app-translation';


export default function LockupDialog({ currentPeriod }: { currentPeriod: number }) {
  const [open, setOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(String(currentPeriod));
  const { toast } = useToast();
  const { t } = useAppTranslation();


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
      <DialogContent className="sm:max-w-md">
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
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="3" id="r1" className="peer sr-only" />
                <Label
                  htmlFor="r1"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  {t('lockup.months', { count: 3 })}
                </Label>
              </div>
              <div>
                <RadioGroupItem value="6" id="r2" className="peer sr-only" />
                <Label
                  htmlFor="r2"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                   {t('lockup.months', { count: 6 })}
                </Label>
              </div>
              <div>
                <RadioGroupItem value="12" id="r3" className="peer sr-only" />
                <Label
                  htmlFor="r3"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                   {t('lockup.months', { count: 12 })}
                </Label>
              </div>
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
