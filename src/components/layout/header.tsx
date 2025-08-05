
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
  DropdownMenuSeparator,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SolanaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4.055 13.334h5.213a.333.333 0 00.333-.333V7.788a.333.333 0 00-.333-.334H4.055a.333.333 0 00-.333.334v5.213c0 .184.15.333.333.333zm5.546-5.88H19.94a.333.333 0 00.333-.333V1.808a.333.333 0 00-.333-.333H9.601a.333.333 0 00-.333.333v5.213c0 .184.15.333.333.333zm-5.546 11.43h5.213a.333.333 0 00.333-.333v-5.214a.333.333 0 00-.333-.333H4.055a.333.333 0 00-.333.333v5.214c0 .184.15.333.333.333zm5.546.334H19.94a.333.333 0 00.333-.333v-5.214a.333.333 0 00-.333-.333H9.601a.333.333 0 00-.333.333v5.214c0 .184.15.333.333.333z" fill="url(#solana-gradient)"></path>
        <defs>
            <linearGradient id="solana-gradient" x1="4.57" x2="17.61" y1="3.35" y2="20.35" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"></stop><stop offset="1" stopColor="#DC1FFF"></stop></linearGradient>
        </defs>
    </svg>
);

const MetamaskLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" {...props}>
        <path d="M228.9 90.9c-2.4-5.3-7.5-9.3-13.2-11.4L133 34.3c-2.5-1-5.3-1-7.8 0L42.2 79.5c-5.7 2.1-10.8 6.1-13.2 11.4-2.4 5.3-2.6 11.3-.6 16.8l32.3 89.2c2.4 6.7 8.3 11.4 15.4 12.3 1.3.2 2.6.2 3.9.2 5.9 0 11.4-3 14.5-8.1l20.4-34.1 20.4 34.1c3.1 5.1 8.6 8.1 14.5 8.1 1.3 0 2.6 0 3.9-.2 7.1-1 13-5.6 15.4-12.3l32.3-89.2c1.9-5.5 1.7-11.5-.7-16.8zM211.8 98.6L196.3 141c-1.3 3.6-4.3 6.1-8 6.5-1.4.2-2.8.2-4.2-.1-4.2-1-7.5-4-8.8-8l-18.9-52.1c-1.5-4-5.2-6.5-9.4-6.5s-7.9 2.5-9.4 6.5L120.7 184c-1.3 3.9-4.6 6.9-8.8 8-.8.3-1.6.4-2.4.4-1.2 0-2.3-.2-3.4-.6-3.7-.4-6.7-2.9-8-6.5L84.2 98.6 128.1 82l83.7 16.6z"></path>
    </svg>
);

export default function AppHeader() {
  const pathname = usePathname();
  const { web3UserAddress, connectWallet, signOut } = useAuth();
  const { t, i18n } = useAppTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  const navItems = [
      { href: '/', label: t('header.dashboard') },
      { href: '/oracle', label: t('header.oracle') },
      { href: '/planner', label: t('header.planner') },
      { href: '/trade', label: t('header.trade') },
      { href: '/faq', label: t('header.faq') },
      { href: '/proof-of-funds', label: t('header.proofOfFunds') },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:px-6">
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
        <div className="flex items-center gap-1 rounded-sm border border-border bg-secondary/50 p-1">
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

        {web3UserAddress ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={signOut} variant='outline'>
                            <Wallet className="mr-2" />
                            {formatAddress(web3UserAddress)}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('header.signOut')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Wallet className="mr-2" />
                        {t('header.connectWallet')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => connectWallet('solana')}>
                       <SolanaLogo className="mr-2 h-5 w-5"/> {t('header.connectPhantom')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => connectWallet('ethereum')}>
                       <MetamaskLogo className="mr-2 h-5 w-5" /> {t('header.connectMetamask')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
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
        <SheetContent side="left" className='border-r border-border'>
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
