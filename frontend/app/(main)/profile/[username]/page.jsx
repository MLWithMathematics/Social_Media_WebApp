/**
 * app/(main)/settings/profile/page.jsx - Edit profile form
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RiCameraLine, RiLoader4Line, RiArrowLeftLine, RiLinkM, RiUser3Line } from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import { userService } from '@/services/userService';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('bio', form.bio);
    formData.append('website', form.website);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      router.push(`/profile/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="btn-ghost p-2 rounded-xl"
        >
          <RiArrowLeftLine className="text-xl" />
        </button>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Edit Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            {avatarPreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4"
                style={{ ringColor: 'var(--accent)' }}>
                <Image src={avatarPreview} alt="Preview" fill className="object-cover" sizes="96px" />
              </div>
            ) : (
              <Avatar src={user.avatar?.url} name={user.name || user.username} size="xl" ring />
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              style={{ backgroundColor: 'rgba(99,102,241,0.65)' }}
            >
              <RiCameraLine className="text-white text-2xl" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-bold"
            style={{ color: 'var(--accent)' }}
          >
            Change photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Form fields */}
        <div className="card p-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Display Name
            </label>
            <div className="relative">
              <RiUser3Line className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your display name"
                maxLength={60}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell people about yourself…"
              rows={3}
              maxLength={200}
              className="input resize-none"
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
              {200 - form.bio.length} characters left
            </p>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Website
            </label>
            <div className="relative">
              <RiLinkM className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }} />
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yoursite.com"
                maxLength={100}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex-1"
          >
            {isSubmitting
              ? <RiLoader4Line className="animate-spin text-lg" />
              : 'Save Changes'
            }
          </motion.button>
        </div>
      </form>
    </div>
  );
}