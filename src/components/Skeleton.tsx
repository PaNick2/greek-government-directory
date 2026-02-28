export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
  )
}

export function MinisterCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <SkeletonBlock className="h-14 w-14 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-3/4 mb-2" />
      <SkeletonBlock className="h-3 w-1/2 mb-1" />
      <SkeletonBlock className="h-3 w-2/3" />
      <div className="mt-3 pt-3 border-t border-slate-100">
        <SkeletonBlock className="h-5 w-16 rounded" />
      </div>
    </div>
  )
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-1/3" />
        <SkeletonBlock className="h-3 w-1/4" />
      </div>
      <SkeletonBlock className="h-3 w-20 ml-4" />
    </div>
  )
}

export function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  )
}
