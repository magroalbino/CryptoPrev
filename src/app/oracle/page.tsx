
'use client';
import { useAuth } from "@/lib/firebase-auth";
import OracleForm from "@/components/oracle/oracle-form";
import { useAppTranslation } from "@/hooks/use-app-translation";

export default function OraclePage() {
  const { t } = useAppTranslation();

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
