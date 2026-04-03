/**
 * services/commentService.js - Comment API calls
 */

import api from '@/lib/api';

export const commentService = {
  getComments: (postId, page = 1) =>
    api.get(`/comments/post/${postId}`, { params: { page, limit: 20 } }),

  addComment: (postId, data) => api.post(`/comments/post/${postId}`, data),

  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
};
