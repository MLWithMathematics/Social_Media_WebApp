/**
 * app/(main)/explore/page.jsx - Public posts grid
 */

'use client';
import { RiFireLine, RiGridLine, RiLoader4Line, RiCompassLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
// import { RiFireLine, RiGridLine, RiLoader4Line } from 'react-icons/ri';
import { postService } from '@/services/postService';

function ExploreCard({ post, index }) {
  const media = post.media?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <Link href={`/profile/${post.author?.username}`}>
        {media?.url ? (
          <Image
            src={media.url}
            alt={post.caption || 'Post'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs text-center line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
              {post.caption}
            </p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4"
          style={{ backgroundColor: 'rgba(99,102,241,0.6)' }}>
          <span className="text-white text-sm font-bold flex items-center gap-1">
            ❤️ {post.likesCount || post.likes?.length || 0}
          </span>
          <span className="text-white text-sm font-bold flex items-center gap-1">
            💬 {post.commentsCount || 0}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setIsLoading(true); else setLoadingMore(true);
    try {
      const res = await postService.getExplorePosts(pageNum);
      const newPosts = res.data.posts || [];
      setPosts((prev) => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(res.data.hasMore);
    } catch {}
    setIsLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { loadPosts(1, true); }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          <RiCompassLine className="text-white text-lg" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Explore
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Discover posts from the community
          </p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌍</div>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Nothing to explore yet
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Be the first to share something with the world!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post, i) => (
              <ExploreCard key={post._id} post={post} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-outline px-8 py-2.5"
              >
                {loadingMore
                  ? <RiLoader4Line className="animate-spin" />
                  : 'Load more'
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}