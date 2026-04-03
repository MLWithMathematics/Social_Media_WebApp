/**
 * app/layout.jsx - Root Server Component layout
 * Providers (ThemeProvider, Toaster) are extracted to providers.jsx
 * so this file can remain a Server Component and export metadata.
 */

import { Playfair_Display, Lato } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata = {
  title: { default: 'Luminary', template: '%s | Luminary' },
  description: 'Share your light with the world.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Luminary',
    description: 'Share your light with the world.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${lato.variable} font-body antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}