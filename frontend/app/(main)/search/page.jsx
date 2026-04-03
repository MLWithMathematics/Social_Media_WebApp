/**
 * app/(main)/search/page.jsx - Search users + hashtag posts
 *
 * Fix: useSearchParams() must be wrapped in <Suspense> in Next.js 14.
 * Pattern: split into SearchContent (uses hook) + SearchPage (provides Suspense).
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSearchLine, RiHashtag, RiUser3Line } from 'react-icons/ri';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { useDebounce } from '@/hooks/useDebounce';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/ui/FollowButton';
import PostCard from '@/components/post/PostCard';

// ── Inner component that safely uses useSearchParams ─────────────────────────
function SearchContent() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialTag ? `#${initialTag}` : '');
  const [tab, setTab] = useState(initialTag ? 'hashtag' : 'users');
  const [users, setUsers] = useState([]);
  const [hashtagPosts, setHashtagPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) { setUsers([]); setHashtagPosts([]); return; }
    setIsLoading(true);

    if (q.startsWith('#')) {
      const tag = q.slice(1);
      if (tag.length < 1) { setIsLoading(false); return; }
      setTab('hashtag');
      postService.getHashtagPosts(tag)
        .then((res) => { setHashtagPosts(res.data.posts || []); })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setTab('users');
      userService.searchUsers(q)
        .then((res) => { setUsers(res.data.users || []); })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [debouncedQuery]);

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-6">
        <RiSearchLine
          className="absolute left-4 top-1/2 -translate-y-1/2 text-lg"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people or #hashtags…"
          autoFocus
          className="input pl-11 py-3.5 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Hint chips */}
      {!query && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-6">
          {['#design', '#photography', '#travel', '#tech', '#art'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              <RiHashtag style={{ color: 'var(--accent)' }} />
              {tag.slice(1)}
            </button>
          ))}
        </motion.div>
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div
            className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {/* User results */}
        {!isLoading && tab === 'users' && users.length > 0 && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              <RiUser3Line className="inline mr-1" /> People
            </p>
            <div className="card divide-y">
              {users.map((u, i) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Link href={`/profile/${u.username}`} className="flex-shrink-0">
                    <Avatar src={u.avatar?.url} name={u.name || u.username} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${u.username}`}>
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {u.name || u.username}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        @{u.username} · {u.followers?.length ?? 0} followers
                      </p>
                    </Link>
                    {u.bio && (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {u.bio}
                      </p>
                    )}
                  </div>
                  <FollowButton userId={u._id} initialFollowing={false} compact />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hashtag posts */}
        {!isLoading && tab === 'hashtag' && (
          <motion.div key="hashtag" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              <RiHashtag className="inline mr-1" style={{ color: 'var(--accent)' }} />
              {debouncedQuery} — {hashtagPosts.length} posts
            </p>
            {hashtagPosts.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                No posts found for this hashtag
              </div>
            ) : (
              hashtagPosts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && query && users.length === 0 && hashtagPosts.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>No results for "{debouncedQuery}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Fallback shown while Suspense resolves ────────────────────────────────────
function SearchFallback() {
  return (
    <div className="flex justify-center py-12">
      <div
        className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

// ── Page export — wraps SearchContent in Suspense ─────────────────────────────
export default function SearchPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
        Search
      </h1>
      <Suspense fallback={<SearchFallback />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
