/**
 * components/layout/RightPanel.jsx - Suggested users + trending (restyled)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RiHashtag, RiFireLine, RiUserSmileLine } from 'react-icons/ri';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/ui/FollowButton';

export default function RightPanel() {
  const { user } = useAuthStore();
  const [suggested, setSuggested] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      userService.getSuggested().catch(() => ({ data: { users: [] } })),
      postService.getTrendingHashtags().catch(() => ({ data: { hashtags: [] } })),
    ]).then(([usersRes, trendRes]) => {
      setSuggested(usersRes.data.users || []);
      setTrending(trendRes.data.hashtags || []);
    });
  }, [user]);

  return (
    <div className="flex flex-col gap-6 pt-2">

      {/* Suggested users */}
      {suggested.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <RiUserSmileLine style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              Suggested for you
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {suggested.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <Link href={`/profile/${u.username}`} className="flex-shrink-0">
                  <Avatar src={u.avatar?.url} name={u.name || u.username} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.username}`}>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {u.name || u.username}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      @{u.username}
                    </p>
                  </Link>
                </div>
                <FollowButton userId={u._id} initialFollowing={false} compact />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trending hashtags */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <RiFireLine style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              Trending
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            {trending.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/search?tag=${item._id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                      style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                      #
                    </span>
                    {item._id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {item.count}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <p className="text-[11px] mt-auto" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Luminary
      </p>
    </div>
  );
}