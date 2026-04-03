'use client';

/**
 * app/providers.jsx - Client-only wrapper for context providers
 * ThemeProvider and Toaster both use createContext internally,
 * so they must live in a Client Component.
 */

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-lato)',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </ThemeProvider>
  );
}
