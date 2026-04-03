/**
 * components/post/CommentSection.jsx - Threaded comments with real-time typing
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { RiHeartLine, RiHeartFill, RiCornerDownRightLine, RiDeleteBinLine } from 'react-icons/ri';
import { commentService } from '@/services/commentService';
import useAuthStore from '@/store/authStore';
import usePostStore from '@/store/postStore';
import { getSocket } from '@/lib/socket';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';

function CommentItem({ comment, postId, onDelete, depth = 0 }) {
  const { user } = useAuthStore();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [replies, setReplies] = useState(comment.replies || []);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    setIsLiked((v) => !v);
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));
    try { await commentService.likeComment(comment._id); } catch { setIsLiked((v) => !v); }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await commentService.addComment(postId, {
        text: replyText.trim(),
        parentComment: comment._id,
      });
      setReplies((prev) => [...prev, res.data.comment]);
      setReplyText('');
      setShowReply(false);
    } catch {
      toast.error('Failed to add reply');
    }
    setSubmitting(false);
  };

  const isOwner = user?._id === (comment.author?._id || comment.author);

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l pl-3' : ''}`}
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex gap-2 group">
        <Link href={`/profile/${comment.author?.username}`} className="flex-shrink-0">
          <Avatar src={comment.author?.avatar?.url} name={comment.author?.username} size="xs" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="rounded-xl px-3 py-2 inline-block max-w-full"
            style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Link href={`/profile/${comment.author?.username}`}
              className="text-xs font-bold mr-1" style={{ color: 'var(--text-primary)' }}>
              {comment.author?.username}
            </Link>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {comment.text}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {depth === 0 && (
              <button onClick={() => setShowReply((v) => !v)}
                className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                Reply
              </button>
            )}
            <button onClick={handleLike}
              className="flex items-center gap-0.5 text-[11px]"
              style={{ color: isLiked ? '#e05252' : 'var(--text-muted)' }}>
              {isLiked ? <RiHeartFill /> : <RiHeartLine />}
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>
            {isOwner && (
              <button onClick={() => onDelete(comment._id)}
                className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--destructive)' }}>
                <RiDeleteBinLine />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {replies.map((r) => (
            <CommentItem key={r._id} comment={r} postId={postId} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Reply input */}
      <AnimatePresence>
        {showReply && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitReply}
            className="ml-8 mt-2 flex gap-2"
          >
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to @${comment.author?.username}…`}
              autoFocus
              className="input flex-1 py-2 text-xs"
            />
            <button type="submit" disabled={submitting || !replyText.trim()} className="btn-primary py-2 px-3 text-xs">
              {submitting ? '…' : 'Send'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { user } = useAuthStore();
  const { incrementComments } = usePostStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    commentService.getComments(postId).then((res) => {
      setComments(res.data.comments || []);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    // Real-time new comment
    const socket = getSocket();
    const handler = ({ comment, postId: pid }) => {
      if (pid === postId && !comment.parentComment) {
        setComments((prev) => [comment, ...prev]);
      }
    };
    socket.on('newComment', handler);
    return () => socket.off('newComment', handler);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await commentService.addComment(postId, { text: text.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      incrementComments(postId);
      setText('');
    } catch {
      toast.error('Failed to post comment');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add comment */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Avatar src={user.avatar?.url} name={user.username} size="xs" />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="input flex-1 py-2 text-sm"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="btn-primary py-2 px-3 text-sm"
          >
            {isSubmitting ? '…' : 'Post'}
          </button>
        </form>
      )}

      {/* Comments list */}
      {isLoading ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CommentItem comment={c} postId={postId} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
