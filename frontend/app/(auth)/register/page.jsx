/**
 * app/(auth)/register/page.jsx - Registration form
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine, RiLoader4Line, RiCheckLine } from 'react-icons/ri';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '6+ characters', ok: password.length >= 6 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {checks.map(({ label, ok }) => (
        <span key={label} className="flex items-center gap-1 text-[11px]"
          style={{ color: ok ? 'var(--success)' : 'var(--text-muted)' }}>
          <RiCheckLine className={ok ? 'opacity-100' : 'opacity-0'} />
          {label}
        </span>
      ))}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    let val = e.target.value;
    if (field === 'username') val = val.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setForm({ ...form, [field]: val });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await register(form);
    if (res.success) {
      toast.success('Account created! Welcome to Luminary ✨');
      router.push('/feed');
    } else {
      toast.error(res.error);
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-7">
        <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Join Luminary
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Create your account and start sharing
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <motion.div variants={item}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Display Name
          </label>
          <input
            value={form.name}
            onChange={set('name')}
            placeholder="Your full name"
            className="input"
          />
        </motion.div>

        <motion.div variants={item}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Username <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
            <input
              value={form.username}
              onChange={set('username')}
              placeholder="yourhandle"
              className={`input pl-8 ${errors.username ? 'border-[var(--destructive)]' : ''}`}
              maxLength={30}
            />
          </div>
          {errors.username && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{errors.username}</p>}
        </motion.div>

        <motion.div variants={item}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Email <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={`input ${errors.email ? 'border-[var(--destructive)]' : ''}`}
          />
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{errors.email}</p>}
        </motion.div>

        <motion.div variants={item}>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Password <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="Create a strong password"
              className={`input pr-11 ${errors.password ? 'border-[var(--destructive)]' : ''}`}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
          {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{errors.password}</p>}
        </motion.div>

        <motion.button
          variants={item}
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full py-3 mt-1 text-base"
        >
          {isLoading ? <RiLoader4Line className="animate-spin text-xl" /> : 'Create Account'}
        </motion.button>
      </form>

      <motion.p variants={item} className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-bold" style={{ color: 'var(--accent)' }}>Sign in</Link>
      </motion.p>
    </motion.div>
  );
}
