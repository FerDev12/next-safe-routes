import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Footer } from '@/components/footer';
import './globals.css';

import dynamic from 'next/dynamic';
import { TooltipProvider } from '@/components/ui/tooltip';

const VersionContextProvider = dynamic(
  () => import('@/components/context/version'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Next Safe Routes',
  metadataBase: new URL('https://next-safe-routes.vercel.app/'),
  description: 'This is the official documentation site for Next Safe Routes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-regular`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <VersionContextProvider>
              <Navbar />
              <main className='sm:container mx-auto w-[88vw] h-auto'>
                {children}
              </main>
              <Footer />
            </VersionContextProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
