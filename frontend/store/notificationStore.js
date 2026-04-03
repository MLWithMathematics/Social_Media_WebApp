/**
 * store/notificationStore.js - Notifications state
 */

import { create } from 'zustand';
import api from '@/lib/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Push real-time notification from socket
  pushNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  markRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread = get().notifications.find((n) => n._id === id && !n.isRead);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
    } catch {}
  },
}));

export default useNotificationStore;
