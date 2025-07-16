'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft } from 'lucide-react';

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
]

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-foreground/50 bg-background/50 px-4 backdrop-blur-sm md:px-6">
      <nav className="hidden w-full items-center gap-6 md:flex">
        <Link
          href="/"
          className="mr-auto flex items-center gap-2 text-lg font-semibold"
        >
          <Logo className="h-8 w-8" />
          <span className="font-bold text-lg">CryptoPrev</span>
        </Link>
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
