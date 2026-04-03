/**
 * services/userService.js - User/Profile API calls
 */

import api from '@/lib/api';

export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),

  getUserPosts: (username, page = 1) =>
    api.get(`/users/${username}/posts`, { params: { page, limit: 12 } }),

  updateProfile: (formData) =>
    api.patch('/users/me/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),

  getFollowers: (username) => api.get(`/users/${username}/followers`),

  getFollowing: (username) => api.get(`/users/${username}/following`),

  getSuggested: () => api.get('/users/suggested'),

  searchUsers: (q) => api.get('/search/users', { params: { q } }),
};
