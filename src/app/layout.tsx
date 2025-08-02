
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/contexts/CartProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getSettings } from '@/services/settingsService';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from './actions';


// export const metadata: Metadata = {
//   title: 'Bite Craft',
//   description: 'Delicious food delivered to your doorstep.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  const isPublicPage = !pathname.startsWith('/admin');

  useEffect(() => {
    const applyPublicSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.primaryColor) {
          document.documentElement.style.setProperty('--primary', settings.primaryColor);
        }
        if (settings.accentColor) {
          document.documentElement.style.setProperty('--accent', settings.accentColor);
        }
      } catch (error) {
        console.error("Could not apply theme settings on public pages", error)
      }
    };

    if (isPublicPage) {
      applyPublicSettings();
      logPageView(pathname);
    }
  }, [pathname, isPublicPage]);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <title>Bite Craft</title>
        <meta name="description" content="Delicious food delivered to your doorstep." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
