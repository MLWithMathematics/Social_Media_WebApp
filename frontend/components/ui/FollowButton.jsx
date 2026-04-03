/**
 * components/ui/FollowButton.jsx - Follow/Unfollow toggle with optimistic UI
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { userService } from '@/services/userService';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function FollowButton({ userId, initialFollowing = false, compact = false, onToggle }) {
  const { user, addFollowing, removeFollowing } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!user || user._id === userId) return null;

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const prev = isFollowing;
    setIsFollowing(!prev);
    prev ? removeFollowing(userId) : addFollowing(userId);

    try {
      const res = await userService.toggleFollow(userId);
      const nowFollowing = res.data.isFollowing;
      setIsFollowing(nowFollowing);
      onToggle?.(nowFollowing);
    } catch {
      setIsFollowing(prev);
      prev ? addFollowing(userId) : removeFollowing(userId);
      toast.error('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95 flex-shrink-0"
        style={
          isFollowing
            ? { border: '1.5px solid var(--border)', color: 'var(--text-secondary)' }
            : { backgroundColor: 'var(--accent)', color: 'white' }
        }
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.96 }}
      className="px-6 py-2 rounded-xl text-sm font-bold transition-all duration-150"
      style={
        isFollowing
          ? {
              border: '1.5px solid var(--border)',
              color: isHovered ? 'var(--destructive)' : 'var(--text-primary)',
              borderColor: isHovered ? 'var(--destructive)' : 'var(--border)',
            }
          : {
              backgroundColor: 'var(--accent)',
              color: 'white',
            }
      }
    >
      {isLoading ? '...' : isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow'}
    </motion.button>
  );
}
