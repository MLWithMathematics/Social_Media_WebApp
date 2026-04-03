/**
 * app/(auth)/layout.jsx - Centered auth layout with brand panel
 */

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Brand panel (desktop only) */}
      <div
        className="hidden lg:flex flex-col justify-center items-start w-1/2 px-20 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--accent)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--accent)' }} />

        <div className="relative z-10">
          <h1 className="font-display text-6xl font-bold mb-4 text-gradient leading-tight">
            Luminary
          </h1>
          <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Share your light with the world. Connect with people who inspire you.
          </p>
          <div className="flex flex-col gap-3">
            {['✨ Share moments that matter', '💬 Connect with your community', '🔖 Save what inspires you', '🔔 Never miss a moment'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gradient">Luminary</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
