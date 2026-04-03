/**
 * app/(main)/profile/[username]/page.jsx - User profile with posts grid
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RiLinkM, RiMapPinLine, RiSettings3Line, RiGridLine, RiBookmarkLine } from 'react-icons/ri';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/ui/FollowButton';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import PostCard from '@/components/post/PostCard';
import toast from 'react-hot-toast';

function StatPill({ label, value, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 transition-opacity hover:opacity-70">
      <span className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{value ?? 0}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [tab, setTab] = useState('posts'); // 'posts' | 'bookmarks'
  const [bookmarks, setBookmarks] = useState([]);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    setIsLoading(true);
    setPostsLoading(true);
    userService.getProfile(username)
      .then((res) => { setProfile(res.data.user); setIsLoading(false); })
      .catch(() => { setIsLoading(false); toast.error('Profile not found'); });

    userService.getUserPosts(username)
      .then((res) => { setPosts(res.data.posts || []); setPostsLoading(false); })
      .catch(() => setPostsLoading(false));
  }, [username]);

  const loadBookmarks = useCallback(async () => {
    if (!isOwnProfile) return;
    try {
      const res = await postService.getBookmarks();
      setBookmarks(res.data.posts || []);
    } catch {}
  }, [isOwnProfile]);

  useEffect(() => {
    if (tab === 'bookmarks') loadBookmarks();
  }, [tab, loadBookmarks]);

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>User not found</div>;

  const displayPosts = tab === 'bookmarks' ? bookmarks : posts;

  return (
    <div>
      {/* ── Profile Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <Avatar
            src={profile.avatar?.url}
            name={profile.name || profile.username}
            size="2xl"
            ring
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
              <div>
                <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile.name || profile.username}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
              </div>
              <div className="flex gap-2 sm:ml-auto">
                {isOwnProfile ? (
                  <Link href="/settings/profile" className="btn-outline text-sm">
                    <RiSettings3Line /> Edit Profile
                  </Link>
                ) : (
                  <FollowButton
                    userId={profile._id}
                    initialFollowing={profile.isFollowing}
                    onToggle={(following) =>
                      setProfile((p) => ({
                        ...p,
                        isFollowing: following,
                        followersCount: following ? p.followersCount + 1 : p.followersCount - 1,
                      }))
                    }
                  />
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 mb-3">
              <StatPill label="Posts" value={profile.postsCount} />
              <StatPill label="Followers" value={profile.followersCount} />
              <StatPill label="Following" value={profile.followingCount} />
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {profile.bio}
              </p>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-sm mt-1 w-fit"
                style={{ color: 'var(--accent)' }}>
                <RiLinkM /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'posts',     Icon: RiGridLine,     label: 'Posts' },
            ...(isOwnProfile ? [{ key: 'bookmarks', Icon: RiBookmarkLine, label: 'Saved' }] : []),
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative"
              style={{ color: tab === key ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <Icon />
              {label}
              {tab === key && (
                <motion.div layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Posts Grid / List ── */}
      {postsLoading ? (
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-lg" />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{tab === 'bookmarks' ? '🔖' : '📷'}</div>
          <p style={{ color: 'var(--text-muted)' }}>
            {tab === 'bookmarks' ? 'No bookmarks yet' : 'No posts yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {displayPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
