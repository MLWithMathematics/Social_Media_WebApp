/**
 * components/post/CreatePostModal.jsx - Modal for creating new posts
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { RiCloseLine, RiImageAddLine, RiVideoAddLine, RiMapPinLine, RiLoader4Line } from 'react-icons/ri';
import usePostStore from '@/store/postStore';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose }) {
  const { user } = useAuthStore();
  const { prependPost } = usePostStore();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = useCallback((newFiles) => {
    const accepted = Array.from(newFiles).slice(0, 5);
    setFiles(accepted);
    setPreviews(accepted.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
    })));
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeMedia = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && files.length === 0) {
      return toast.error('Add a caption or media to post');
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('location', location);
    files.forEach((f) => formData.append('media', f));

    try {
      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      prependPost(res.data.post);
      toast.success('Post shared!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create post');
    }
    setIsSubmitting(false);
  };

  const remaining = 2200 - caption.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg rounded-2xl overflow-hidden shadow-modal"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              New Post
            </h2>
            <button onClick={onClose} className="btn-ghost p-2 rounded-full">
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar?.url} name={user?.username} size="md" />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || user?.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{user?.username}</p>
              </div>
            </div>

            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={2200}
              rows={4}
              autoFocus
              className="input resize-none text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-lato)' }}
            />
            <p className="text-xs text-right -mt-2" style={{ color: remaining < 100 ? 'var(--destructive)' : 'var(--text-muted)' }}>
              {remaining} characters remaining
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 input py-2">
              <RiMapPinLine style={{ color: 'var(--accent)' }} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (optional)"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Media drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
              style={{
                borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
                backgroundColor: dragOver ? 'var(--accent-light)' : 'transparent',
              }}
            >
              <div className="flex justify-center gap-3 mb-2" style={{ color: 'var(--text-muted)' }}>
                <RiImageAddLine className="text-2xl" />
                <RiVideoAddLine className="text-2xl" />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Drag & drop or <span style={{ color: 'var(--accent)', fontWeight: 700 }}>browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                JPG, PNG, WebP, GIF, MP4 · Max 5 files
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden flex-shrink-0"
                    style={{ width: 80, height: 80 }}>
                    {p.type === 'video'
                      ? <video src={p.url} className="w-full h-full object-cover" />
                      : <Image src={p.url} alt="preview" fill className="object-cover" sizes="80px" />
                    }
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button onClick={onClose} className="btn-outline">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary min-w-[100px]"
            >
              {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : 'Share Post'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
