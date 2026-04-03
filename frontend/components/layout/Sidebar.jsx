/**
 * components/layout/Sidebar.jsx
 * Fix: `mounted` state prevents server/client theme mismatch (Error 2).
 * The theme icon/label only renders after client hydration.
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
import { useState, useEffect } from 'react';

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

  // Prevent hydration mismatch — theme is unknown until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isDark = mounted && theme === 'dark';

  return (
    <>
      <div className="flex flex-col h-full px-3 py-6 gap-1">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-display text-xl font-bold text-gradient tracking-tight">
            Luminary
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ href, label, Icon, IconActive }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            const isNotif = href === '/notifications';
            return (
              <Link key={href} href={href} className={`nav-link ${isActive ? 'active' : ''}`}>
                <span className="relative text-xl flex-shrink-0">
                  {isActive ? <IconActive /> : <Icon />}
                  {isNotif && unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Create post */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold mt-3 transition-all w-full text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' }}
          >
            <RiAddCircleLine className="text-xl flex-shrink-0" />
            <span>New Post</span>
          </motion.button>
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col gap-1 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Theme toggle — only render after mount to prevent hydration mismatch */}
          <button
            onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
            className="nav-link"
            suppressHydrationWarning
          >
            {/* Always render a consistent icon server-side; swap after mount */}
            {mounted
              ? isDark
                ? <RiSunLine className="text-xl" />
                : <RiMoonLine className="text-xl" />
              : <RiMoonLine className="text-xl" />
            }
            <span suppressHydrationWarning>
              {mounted ? (isDark ? 'Light Mode' : 'Dark Mode') : 'Dark Mode'}
            </span>
          </button>

          {/* Profile card */}
          {user && (
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all"
              style={{ ':hover': { backgroundColor: 'var(--bg-tertiary)' } }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
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