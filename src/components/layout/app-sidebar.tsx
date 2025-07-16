'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles, Landmark } from 'lucide-react';

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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">CryptoPrev</span>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/'}
            tooltip="Dashboard"
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
