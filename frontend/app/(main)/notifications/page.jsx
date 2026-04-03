/**
 * app/(main)/notifications/page.jsx - Notification list with mark-all-read
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { RiHeartFill, RiChat1Fill, RiUserAddFill, RiAtLine, RiCheckDoubleLine } from 'react-icons/ri';
import useNotificationStore from '@/store/notificationStore';
import Avatar from '@/components/ui/Avatar';
import { NotificationSkeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

const TYPE_CONFIG = {
  like:    { Icon: RiHeartFill,    color: '#e05252', label: 'liked your post' },
  comment: { Icon: RiChat1Fill,    color: 'var(--accent)', label: 'commented on your post' },
  follow:  { Icon: RiUserAddFill,  color: 'var(--success)', label: 'started following you' },
  reply:   { Icon: RiChat1Fill,    color: 'var(--accent)', label: 'replied to a comment' },
  mention: { Icon: RiAtLine,       color: 'var(--accent)', label: 'mentioned you' },
};

function NotificationItem({ notif }) {
  const { markRead } = useNotificationStore();
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.like;
  const { Icon, color, label } = config;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      onClick={() => !notif.isRead && markRead(notif._id)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
      style={{ backgroundColor: notif.isRead ? 'transparent' : 'var(--accent-light)' }}
    >
      {/* Avatar with type icon badge */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={notif.sender?.avatar?.url}
          name={notif.sender?.username}
          size="md"
        />
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: color, color: 'white' }}
        >
          <Icon />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          <Link href={`/profile/${notif.sender?.username}`}
            className="font-bold hover:underline">
            {notif.sender?.username}
          </Link>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Post thumbnail */}
      {notif.post?.media?.[0] && (
        <Link href={`/post/${notif.post._id}`} className="flex-shrink-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image
              src={notif.post.media[0].url}
              alt="Post"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        </Link>
      )}

      {/* Unread dot */}
      {!notif.isRead && (
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
      )}
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--accent)' }}
          >
            <RiCheckDoubleLine /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            All quiet here
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            When someone likes or comments on your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <AnimatePresence initial={false}>
            {notifications.map((notif, i) => (
              <div key={notif._id}>
                <NotificationItem notif={notif} />
                {i < notifications.length - 1 && (
                  <div className="h-px mx-4" style={{ backgroundColor: 'var(--border)' }} />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
