/**
 * app/(auth)/login/page.jsx - Login form
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await login(form);
    if (res.success) {
      toast.success('Welcome back!');
      router.push('/feed');
    } else {
      toast.error(res.error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sign in to your Luminary account
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
            placeholder="you@example.com"
            autoComplete="email"
            className={`input ${errors.email ? 'border-[var(--destructive)]' : ''}`}
          />
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{errors.email}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>Password</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input pr-11 ${errors.password ? 'border-[var(--destructive)]' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
          {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{errors.password}</p>}
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full py-3 mt-2 text-base"
        >
          {isLoading ? <RiLoader4Line className="animate-spin text-xl" /> : 'Sign in'}
        </motion.button>
      </form>

      <motion.p variants={itemVariants} className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link href="/register" className="font-bold" style={{ color: 'var(--accent)' }}>
          Create one
        </Link>
      </motion.p>
    </motion.div>
  );
}
