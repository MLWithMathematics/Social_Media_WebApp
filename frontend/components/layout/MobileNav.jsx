/**
 * components/layout/MobileNav.jsx - Mobile bottom tab bar
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  RiHome5Line, RiHome5Fill,
  RiSearchLine, RiSearchFill,
  RiAddCircleLine,
  RiBellLine, RiBellFill,
  RiUser3Line, RiUser3Fill,
} from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import useNotificationStore from '@/store/notificationStore';
import CreatePostModal from '@/components/post/CreatePostModal';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showCreate, setShowCreate] = useState(false);

  const tabs = [
    { href: '/feed',          Icon: RiHome5Line,    ActiveIcon: RiHome5Fill },
    { href: '/search',        Icon: RiSearchLine,   ActiveIcon: RiSearchFill },
    { href: null,             Icon: RiAddCircleLine, ActiveIcon: RiAddCircleLine, isCreate: true },
    { href: '/notifications', Icon: RiBellLine,     ActiveIcon: RiBellFill, badge: unreadCount },
    { href: user ? `/profile/${user.username}` : '/login',
                              Icon: RiUser3Line,    ActiveIcon: RiUser3Fill },
  ];

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t safe-area-inset-bottom"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map(({ href, Icon, ActiveIcon, isCreate, badge }, i) => {
            if (isCreate) {
              return (
                <button
                  key={i}
                  onClick={() => setShowCreate(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90"
                  style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                  <Icon className="text-2xl" />
                </button>
              );
            }

            const isActive = pathname === href;
            return (
              <Link
                key={i}
                href={href}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {isActive ? <ActiveIcon className="text-2xl" /> : <Icon className="text-2xl" />}
                {badge > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
