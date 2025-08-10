
'use client';
import { useAuth } from "@/lib/firebase-auth";
import OracleForm from "@/components/oracle/oracle-form";
import { useAppTranslation } from "@/hooks/use-app-translation";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function OraclePage() {
  const { t } = useAppTranslation();
  const { web3UserAddress, connectWallet } = useAuth();

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">{t('oracle.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('oracle.description')}
        </p>
      </div>
      {web3UserAddress ? (
        <OracleForm />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
            <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold tracking-tight">{t('dashboard.connectWalletPrompt.title')}</h2>
                <p className="text-muted-foreground mt-2 mb-6">{t('dashboard.connectWalletPrompt.description')}</p>
                <Button onClick={() => connectWallet('solana')} size="lg">
                    <Wallet className="mr-2" />
                    {t('header.connectWallet')}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
