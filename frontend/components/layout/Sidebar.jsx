/**
 * components/layout/Sidebar.jsx - Desktop sidebar with nav, dark mode, user info
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  RiHome5Line, RiHome5Fill,
  RiSearchLine, RiSearchFill,
  RiCompassLine, RiCompassFill,
  RiBookmarkLine, RiBookmarkFill,
  RiBellLine, RiBellFill,
  RiAddCircleLine,
  RiSunLine, RiMoonLine,
  RiLogoutBoxLine,
} from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import useNotificationStore from '@/store/notificationStore';
import Avatar from '@/components/ui/Avatar';
import CreatePostModal from '@/components/post/CreatePostModal';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/feed',          label: 'Home',          Icon: RiHome5Line,    IconActive: RiHome5Fill },
  { href: '/search',        label: 'Search',        Icon: RiSearchLine,   IconActive: RiSearchFill },
  { href: '/explore',       label: 'Explore',       Icon: RiCompassLine,  IconActive: RiCompassFill },
  { href: '/notifications', label: 'Notifications', Icon: RiBellLine,     IconActive: RiBellFill },
  { href: '/bookmarks',     label: 'Bookmarks',     Icon: RiBookmarkLine, IconActive: RiBookmarkFill },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showCreate, setShowCreate] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <div className="flex flex-col h-full px-4 py-6 gap-1">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 px-2 mb-8">
          <span className="font-display text-2xl font-bold text-gradient tracking-tight">
            Luminary
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, Icon, IconActive }) => {
            const isActive = pathname === href;
            const isNotif = href === '/notifications';
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="relative text-xl flex-shrink-0">
                  {isActive ? <IconActive /> : <Icon />}
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Create post button */}
          <button
            onClick={() => setShowCreate(true)}
            className="nav-link mt-2 w-full text-left"
            style={{ color: 'var(--accent)' }}
          >
            <RiAddCircleLine className="text-xl flex-shrink-0" />
            <span className="font-bold">New Post</span>
          </button>
        </nav>

        {/* Bottom: theme + profile + logout */}
        <div className="flex flex-col gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="nav-link"
          >
            {theme === 'dark'
              ? <RiSunLine className="text-xl" />
              : <RiMoonLine className="text-xl" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Profile */}
          {user && (
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all hover:bg-[var(--bg-tertiary)]"
            >
              <Avatar src={user.avatar?.url} name={user.name || user.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name || user.username}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  @{user.username}
                </p>
              </div>
            </Link>
          )}

          {/* Logout */}
          <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--destructive)' }}>
            <RiLogoutBoxLine className="text-xl" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
