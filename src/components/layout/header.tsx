
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft, Wallet, Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { useAuth } from '@/lib/firebase-auth';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function AppHeader() {
  const pathname = usePathname();
  const { web3UserAddress, signInWithWeb3, signOut } = useAuth();
  const { t, i18n } = useAppTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const handleConnectWallet = async () => {
    if (web3UserAddress) {
      await signOut();
    } else {
      await signInWithWeb3();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  const navItems = [
      { href: '/', label: t('header.dashboard') },
      { href: '/oracle', label: t('header.oracle') },
      { href: '/planner', label: t('header.planner') },
      { href: '/simulator', label: t('header.simulator') },
      { href: '/learn', label: t('header.learn') },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-foreground/50 bg-background/50 px-4 backdrop-blur-sm md:px-6">
      <div className='flex items-center gap-6'>
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Logo className="h-8 w-8" />
          <span className="font-bold text-lg">CryptoPrev</span>
        </Link>
      </div>
      <nav className="hidden w-full items-center justify-center gap-6 md:flex">
        <div className="flex items-center gap-1 rounded-sm border-2 border-foreground bg-secondary/50 p-1">
        {navItems.map((item) => (
            <Button key={item.href} asChild variant={pathname === item.href ? 'secondary' : 'ghost'} className='shadow-none border-0'>
                <Link
                    href={item.href}
                    className={cn(
                        "transition-colors",
                        pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    {item.label}
                </Link>
            </Button>
        ))}
        </div>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Button onClick={handleConnectWallet} variant={web3UserAddress ? 'outline' : 'default'}>
            <Wallet className="mr-2 h-4 w-4" />
            {web3UserAddress ? formatAddress(web3UserAddress) : t('header.connectWallet')}
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">{t('header.toggleLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    {t('header.english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('pt')}>
                    {t('header.portuguese')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className='brutalist-border glassmorphic'>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Logo className="h-8 w-8" />
              <span className="font-bold text-lg">CryptoPrev</span>
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "hover:text-accent",
                         pathname === item.href ? "text-foreground font-bold" : "text-muted-foreground"
                    )}
                >
                    {item.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
