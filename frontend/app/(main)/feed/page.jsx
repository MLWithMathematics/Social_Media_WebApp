/**
 * app/(main)/feed/page.jsx - Main feed with infinite scroll + sort toggle
 *
 * NOTE: metadata cannot be exported from 'use client' components in Next.js 14.
 * Page title is set via the layout or a server wrapper if needed.
 */

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTimeLine, RiFireLine } from 'react-icons/ri';
import usePostStore from '@/store/postStore';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PostCard from '@/components/post/PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

export default function FeedPage() {
  const { feed, hasMore, isLoadingFeed, feedSort, fetchFeed, setFeedSort } = usePostStore();

  useEffect(() => {
    if (feed.length === 0) fetchFeed(true);
  }, []);

  const { sentinelRef } = useInfiniteScroll(fetchFeed, hasMore, isLoadingFeed);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Your Feed
        </h1>

        {/* Sort toggle */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'latest',   Icon: RiTimeLine,  label: 'Latest' },
            { key: 'trending', Icon: RiFireLine,   label: 'Top' },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setFeedSort(key)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all"
              style={{
                backgroundColor: feedSort === key ? 'var(--accent)' : 'transparent',
                color: feedSort === key ? 'white' : 'var(--text-muted)',
              }}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Initial skeleton */}
      {isLoadingFeed && feed.length === 0 && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* Empty state */}
      {!isLoadingFeed && feed.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4">✨</div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your feed is empty
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Follow people to see their posts here, or explore what others are sharing.
          </p>
        </motion.div>
      )}

      {/* Posts */}
      <AnimatePresence initial={false}>
        {feed.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </AnimatePresence>

      {/* Loading more */}
      {isLoadingFeed && feed.length > 0 && (
        <div className="flex justify-center py-6">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* End of feed */}
      {!hasMore && feed.length > 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
          You're all caught up! 🎉
        </p>
      )}
    </div>
  );
}
