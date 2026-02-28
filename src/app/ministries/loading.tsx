import { SkeletonBlock } from '@/components/Skeleton'

export default function MinistriesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SkeletonBlock className="h-7 w-36 mb-2 animate-pulse" />
      <SkeletonBlock className="h-4 w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
            <SkeletonBlock className="h-4 w-3/4 mb-2" />
            <SkeletonBlock className="h-3 w-1/2 mb-4" />
            <div className="flex justify-between">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
