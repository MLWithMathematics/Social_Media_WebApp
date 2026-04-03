'use client';

/**
 * app/providers.jsx
 * suppressHydrationWarning on the wrapper div silences the next-themes
 * inline script-tag warning in React 18 App Router.
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
      <div suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-lato)',
              fontSize: '14px',
              borderRadius: '16px',
              padding: '12px 18px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}