/**
 * store/postStore.js - Feed, optimistic like/bookmark mutations
 */

import { create } from 'zustand';
import api from '@/lib/api';

const usePostStore = create((set, get) => ({
  feed: [],
  hasMore: true,
  page: 1,
  isLoadingFeed: false,
  feedSort: 'latest', // 'latest' | 'trending'

  // ── Fetch feed page ──────────────────────────────────────────────────────────
  fetchFeed: async (reset = false) => {
    const { page, isLoadingFeed, hasMore, feedSort } = get();
    if (isLoadingFeed || (!reset && !hasMore)) return;

    const currentPage = reset ? 1 : page;
    set({ isLoadingFeed: true });

    try {
      const res = await api.get('/posts/feed', {
        params: { page: currentPage, limit: 10, sort: feedSort },
      });
      const { posts, hasMore: more } = res.data;
      set((state) => ({
        feed: reset ? posts : [...state.feed, ...posts],
        hasMore: more,
        page: currentPage + 1,
        isLoadingFeed: false,
      }));
    } catch {
      set({ isLoadingFeed: false });
    }
  },

  setFeedSort: (sort) => {
    set({ feedSort: sort, feed: [], page: 1, hasMore: true });
    get().fetchFeed(true);
  },

  // ── Add new post to top of feed ──────────────────────────────────────────────
  prependPost: (post) =>
    set((state) => ({ feed: [post, ...state.feed] })),

  // ── Remove post from feed ────────────────────────────────────────────────────
  removePost: (postId) =>
    set((state) => ({ feed: state.feed.filter((p) => p._id !== postId) })),

  // ── Optimistic like toggle ───────────────────────────────────────────────────
  toggleLike: async (postId, userId) => {
    // Optimistic update
    set((state) => ({
      feed: state.feed.map((p) => {
        if (p._id !== postId) return p;
        const liked = p.isLiked;
        return {
          ...p,
          isLiked: !liked,
          likesCount: liked ? p.likesCount - 1 : p.likesCount + 1,
        };
      }),
    }));
    try {
      await api.post(`/posts/${postId}/like`);
    } catch {
      // Revert on error
      set((state) => ({
        feed: state.feed.map((p) => {
          if (p._id !== postId) return p;
          const liked = p.isLiked;
          return {
            ...p,
            isLiked: !liked,
            likesCount: liked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }),
      }));
    }
  },

  // ── Optimistic bookmark toggle ───────────────────────────────────────────────
  toggleBookmark: async (postId) => {
    set((state) => ({
      feed: state.feed.map((p) =>
        p._id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ),
    }));
    try {
      await api.post(`/posts/${postId}/bookmark`);
    } catch {
      set((state) => ({
        feed: state.feed.map((p) =>
          p._id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        ),
      }));
    }
  },

  // ── Real-time sync from Socket ───────────────────────────────────────────────
  syncLike: ({ postId, likesCount, isLiked, userId }) => {
    set((state) => ({
      feed: state.feed.map((p) =>
        p._id === postId ? { ...p, likesCount, isLiked } : p
      ),
    }));
  },

  incrementComments: (postId) => {
    set((state) => ({
      feed: state.feed.map((p) =>
        p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ),
    }));
  },
}));

export default usePostStore;
