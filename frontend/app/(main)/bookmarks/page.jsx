/**
 * app/(main)/bookmarks/page.jsx - Saved posts
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { postService } from '@/services/postService';
import PostCard from '@/components/post/PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

export default function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    postService.getBookmarks()
      .then((res) => setPosts(res.data.posts || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Bookmarks
      </h1>

      {isLoading ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Nothing saved yet
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tap the bookmark icon on any post to save it here.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
