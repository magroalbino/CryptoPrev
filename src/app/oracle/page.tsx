
'use client';
import { useAuth } from "@/lib/firebase-auth";
import OracleForm from "@/components/oracle/oracle-form";
import { useAppTranslation } from "@/hooks/use-app-translation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OraclePage() {
  const { t } = useAppTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full mt-2 mx-auto" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('oracle.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('oracle.description')}
        </p>
      </div>
      <OracleForm />
    </div>
  );
}
