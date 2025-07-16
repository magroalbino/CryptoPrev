'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles, Bot } from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold">CryptoPrev</span>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/'}
            tooltip="Dashboard"
            size="lg"
          >
            <Link href="/">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith('/oracle')}
            tooltip="DeFi Oracle"
            size="lg"
          >
            <Link href="/oracle">
              <Sparkles />
              <span>DeFi Oracle</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} CryptoPrev
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
