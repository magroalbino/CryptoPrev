import type {Metadata} from 'next';
import './globals.css';
import {Sidebar, SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CryptoPrev - Smart Yields',
  description: 'Maximize your stablecoin yield with our AI-powered DeFi strategies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
