/**
 * hooks/useSocket.js - Connect socket and bind events on mount
 */

'use client';

import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import useAuthStore from '@/store/authStore';
import usePostStore from '@/store/postStore';
import useNotificationStore from '@/store/notificationStore';

export const useSocket = () => {
  const { user } = useAuthStore();
  const { syncLike, incrementComments } = usePostStore();
  const { pushNotification } = useNotificationStore();

  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket(user._id);

    // Real-time like updates
    socket.on('postLike', (data) => syncLike(data));

    // Real-time comment count
    socket.on('newComment', ({ postId }) => incrementComments(postId));

    // Real-time notifications
    socket.on('notification', (notif) => pushNotification(notif));

    return () => {
      socket.off('postLike');
      socket.off('newComment');
      socket.off('notification');
    };
  }, [user?._id]);
};

/**
 * Join/leave a post room for real-time comment/like updates
 */
export const usePostRoom = (postId) => {
  useEffect(() => {
    if (!postId) return;
    const socket = getSocket();
    socket.emit('join:post', postId);
    return () => socket.emit('leave:post', postId);
  }, [postId]);
};
