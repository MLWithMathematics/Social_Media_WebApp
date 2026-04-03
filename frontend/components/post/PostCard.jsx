/**
 * components/post/PostCard.jsx - Full post card with like, comment, bookmark, share
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  RiHeartLine, RiHeartFill,
  RiChat1Line,
  RiBookmarkLine, RiBookmarkFill,
  RiShareLine,
  RiMoreLine,
  RiDeleteBinLine,
  RiEditLine,
  RiMapPinLine,
} from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import usePostStore from '@/store/postStore';
import Avatar from '@/components/ui/Avatar';
import CommentSection from '@/components/post/CommentSection';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function PostCard({ post }) {
  const { user } = useAuthStore();
  const { toggleLike, toggleBookmark, removePost } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);

  const isOwner = user?._id === (post.author?._id || post.author);

  const handleLike = useCallback(() => {
    toggleLike(post._id, user?._id);
    if (!post.isLiked) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 700);
    }
  }, [post._id, post.isLiked, toggleLike, user?._id]);

  const handleDoubleTap = useCallback(() => {
    if (!post.isLiked) handleLike();
  }, [handleLike, post.isLiked]);

  const handleBookmark = () => toggleBookmark(post._id);

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      removePost(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
    setShowMenu(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const captionWithLinks = post.caption?.replace(
    /#([a-zA-Z0-9_]+)/g,
    '<a href="/search?tag=$1" class="font-semibold" style="color:var(--accent)">#$1</a>'
  ).replace(
    /@([a-zA-Z0-9_.]+)/g,
    '<a href="/profile/$1" class="font-semibold" style="color:var(--accent)">@$1</a>'
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="card mb-4 overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link href={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.avatar?.url} name={post.author?.name || post.author?.username} size="md" />
          <div>
            <p className="text-sm font-bold leading-tight group-hover:underline"
              style={{ color: 'var(--text-primary)' }}>
              {post.author?.name || post.author?.username}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {/* 3-dot menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="btn-ghost p-2 rounded-full"
          >
            <RiMoreLine className="text-lg" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 z-20 rounded-xl shadow-modal overflow-hidden w-44"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  {isOwner ? (
                    <>
                      <Link
                        href={`/post/${post._id}/edit`}
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <RiEditLine /> Edit post
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-3 text-sm w-full transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ color: 'var(--destructive)' }}
                      >
                        <RiDeleteBinLine /> Delete post
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { toast('Report feature coming soon'); setShowMenu(false); }}
                      className="flex items-center gap-2 px-4 py-3 text-sm w-full transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Report post
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <div className="px-4 pb-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          <span dangerouslySetInnerHTML={{ __html: captionWithLinks }} />
          {post.isEdited && (
            <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>(edited)</span>
          )}
        </div>
      )}

      {/* ── Location ── */}
      {post.location && (
        <div className="px-4 pb-2 flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <RiMapPinLine /> {post.location}
        </div>
      )}

      {/* ── Media ── */}
      {post.media?.length > 0 && (
        <div
          className="relative w-full overflow-hidden bg-[var(--bg-tertiary)]"
          style={{ maxHeight: 480 }}
          onDoubleClick={handleDoubleTap}
        >
          {post.media[mediaIndex].type === 'video' ? (
            <video
              src={post.media[mediaIndex].url}
              controls
              className="w-full object-contain"
              style={{ maxHeight: 480 }}
            />
          ) : (
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <Image
                src={post.media[mediaIndex].url}
                alt="Post media"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
                loading="lazy"
              />
            </div>
          )}

          {/* Double-tap heart burst */}
          <AnimatePresence>
            {heartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <RiHeartFill className="text-8xl" style={{ color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carousel dots */}
          {post.media.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {post.media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMediaIndex(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: i === mediaIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    transform: i === mediaIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          className="flex items-center gap-1.5 btn-ghost text-sm px-2 py-2"
          style={{ color: post.isLiked ? '#e05252' : 'var(--text-muted)' }}
        >
          {post.isLiked
            ? <RiHeartFill className="text-xl" />
            : <RiHeartLine className="text-xl" />}
          <span>{post.likesCount || 0}</span>
        </motion.button>

        {/* Comment */}
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 btn-ghost text-sm px-2 py-2"
          style={{ color: showComments ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <RiChat1Line className="text-xl" />
          <span>{post.commentsCount || 0}</span>
        </button>

        <div className="flex-1" />

        {/* Bookmark */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleBookmark}
          className="btn-ghost px-2 py-2"
          style={{ color: post.isBookmarked ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {post.isBookmarked ? <RiBookmarkFill className="text-xl" /> : <RiBookmarkLine className="text-xl" />}
        </motion.button>

        {/* Share */}
        <button onClick={handleShare} className="btn-ghost px-2 py-2">
          <RiShareLine className="text-xl" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* ── Comments section ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--border)' }}>
              <CommentSection postId={post._id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
