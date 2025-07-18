
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/oracle', label: 'DeFi Oracle' },
    { href: '/simulator', label: 'Simulator' },
    { href: '/learn', label: 'DeFi Learn' },
]

export default function AppHeader() {
  const pathname = usePathname();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  
  const handleConnectWallet = async () => {
    if (userAddress) {
      // Disconnect
      setUserAddress(null);
    } else {
      // Connect
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          // Request account access
          const accounts = await provider.send('eth_requestAccounts', []);
          setUserAddress(accounts[0]);
        } catch (error) {
          console.error("User rejected the request.");
        }
      } else {
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

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
        <Button onClick={handleConnectWallet} variant={userAddress ? 'outline' : 'default'}>
            <Wallet className="mr-2 h-4 w-4" />
            {userAddress ? formatAddress(userAddress) : 'Connect Wallet'}
        </Button>
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
              href="#"
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
