/**
 * components/ui/Avatar.jsx - User avatar with fallback initials
 */

import Image from 'next/image';

const SIZES = {
  xs:  { px: 28,  text: 'text-[10px]' },
  sm:  { px: 36,  text: 'text-xs' },
  md:  { px: 44,  text: 'text-sm' },
  lg:  { px: 64,  text: 'text-base' },
  xl:  { px: 96,  text: 'text-xl' },
  '2xl': { px: 128, text: 'text-2xl' },
};

export default function Avatar({ src, name = '?', size = 'md', className = '', ring = false }) {
  const { px, text } = SIZES[size] || SIZES.md;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative rounded-full flex-shrink-0 overflow-hidden select-none ${
        ring ? 'ring-2 ring-offset-2' : ''
      } ${className}`}
      style={{
        width: px,
        height: px,
        backgroundColor: 'var(--bg-tertiary)',
        ringColor: 'var(--accent)',
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${px}px`}
          loading="lazy"
        />
      ) : (
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold font-display ${text}`}
          style={{ color: 'var(--accent)' }}
        >
          {initials || '?'}
        </span>
      )}
    </div>
  );
}
