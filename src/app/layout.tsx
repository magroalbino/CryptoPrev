import type {Metadata} from 'next';
import './globals.css';
import AppHeader from '@/components/layout/header';
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
    <html lang="en" className="dark" style={{colorScheme: 'dark'}} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen w-full flex-col">
          <AppHeader />
          <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
