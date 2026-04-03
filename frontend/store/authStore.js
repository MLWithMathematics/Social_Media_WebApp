/**
 * store/authStore.js - Global auth state via Zustand
 *
 * Fix: `partialState` is not a valid Zustand persist option.
 * Correct option is `partialize` (function that picks what to persist).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      // ── Register ────────────────────────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, token } = res.data;
          localStorage.setItem('luminary_token', token);
          connectSocket(user._id);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
      },

      // ── Login ───────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', credentials);
          const { user, token } = res.data;
          localStorage.setItem('luminary_token', token);
          connectSocket(user._id);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('luminary_token');
        disconnectSocket();
        set({ user: null, token: null });
      },

      // ── Refresh /me ─────────────────────────────────────────────────────────
      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user });
        } catch {
          get().logout();
        }
      },

      // ── Update user in store (after profile edits) ──────────────────────────
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // ── Follow state helpers ─────────────────────────────────────────────────
      addFollowing: (userId) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                following: [...(state.user.following || []), { _id: userId }],
                followingCount: (state.user.followingCount || 0) + 1,
              }
            : state.user,
        })),

      removeFollowing: (userId) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                following: (state.user.following || []).filter(
                  (f) => (f._id || f) !== userId
                ),
                followingCount: Math.max(0, (state.user.followingCount || 0) - 1),
              }
            : state.user,
        })),
    }),
    {
      name: 'luminary-auth',
      // `partialize` (not partialState) selects which slices to persist to localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
