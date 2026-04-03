/**
 * components/ui/Skeleton.jsx - Reusable skeleton loaders
 */

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height: '14px' }} />;
}

export function SkeletonCircle({ size = 40 }) {
  return (
    <div
      className="skeleton rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card p-4 mb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size={44} />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-1/4" style={{ height: '11px' }} />
        </div>
      </div>
      {/* Caption */}
      <div className="flex flex-col gap-2 mb-4">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
      </div>
      {/* Image placeholder */}
      <div className="skeleton w-full rounded-xl mb-4" style={{ height: '280px' }} />
      {/* Actions */}
      <div className="flex gap-4">
        <SkeletonLine className="w-16" />
        <SkeletonLine className="w-16" />
        <SkeletonLine className="w-16" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <SkeletonCircle size={96} />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <SkeletonLine className="w-1/2" style={{ height: '20px' }} />
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      <SkeletonCircle size={40} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="w-1/3" style={{ height: '11px' }} />
      </div>
      <div className="skeleton rounded-lg" style={{ width: 48, height: 48 }} />
    </div>
  );
}
