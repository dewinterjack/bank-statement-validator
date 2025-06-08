import '@/styles/globals.css';

import { type Metadata } from 'next';
import { Geist } from 'next/font/google';

import { TRPCReactProvider } from '@/trpc/react';
import { cn } from '@/lib/utils';
import { Header } from './_components/header';

export const metadata: Metadata = {
  title: 'Bank Statement Validator',
  description: 'Validate bank statements',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(geist.variable, 'dark font-sans antialiased')}
    >
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
      </body>
    </html>
  );
}
