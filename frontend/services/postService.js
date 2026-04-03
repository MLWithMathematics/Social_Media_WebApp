/**
 * services/postService.js - Post API calls
 */

import api from '@/lib/api';

export const postService = {
  createPost: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPost: (id) => api.get(`/posts/${id}`),

  updatePost: (id, data) => api.patch(`/posts/${id}`, data),

  deletePost: (id) => api.delete(`/posts/${id}`),

  toggleLike: (id) => api.post(`/posts/${id}/like`),

  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`),

  getBookmarks: () => api.get('/posts/bookmarks'),

  getExplorePosts: (page = 1) =>
    api.get('/posts/explore', { params: { page, limit: 12 } }),

  getTrendingHashtags: () => api.get('/posts/trending/hashtags'),

  getHashtagPosts: (tag, page = 1) =>
    api.get(`/search/hashtag/${tag}`, { params: { page } }),
};
