/**
 * app/(main)/layout.jsx - Authenticated shell with sidebar + right panel
 *
 * Toaster is already mounted in app/providers.jsx — do NOT import it here again.
 */

'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import RightPanel from '@/components/layout/RightPanel';

export default function MainLayout({ children }) {
  const { user, fetchMe } = useAuthStore();

  // Initialise socket listeners once authenticated
  useSocket();

  useEffect(() => {
    if (user) fetchMe();
  }, []);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed left-0 top-0 h-screen z-30 border-r"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <Sidebar />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 xl:ml-72 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* ── Right Panel (desktop only) ── */}
      <aside
        className="hidden xl:block w-80 flex-shrink-0 fixed right-0 top-0 h-screen overflow-y-auto border-l p-6"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <RightPanel />
      </aside>

      {/* ── Mobile bottom nav ── */}
      <MobileNav />
    </div>
  );
}
