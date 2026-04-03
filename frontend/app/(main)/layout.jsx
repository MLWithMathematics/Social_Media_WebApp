/**
 * app/(main)/layout.jsx - Authenticated shell
 * Fix: Added xl:mr-80 so content doesn't slide under the fixed right panel.
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

  useSocket();

  useEffect(() => {
    if (user) fetchMe();
  }, []);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar — fixed left */}
      <aside
        className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed left-0 top-0 h-screen z-30 border-r"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <Sidebar />
      </aside>

      {/* Main content — left margin for sidebar, right margin for right panel */}
      <main className="flex-1 lg:ml-64 xl:ml-72 xl:mr-80 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Right panel — fixed right, desktop only */}
      <aside
        className="hidden xl:flex flex-col w-80 flex-shrink-0 fixed right-0 top-0 h-screen overflow-y-auto border-l p-5"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <RightPanel />
      </aside>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}