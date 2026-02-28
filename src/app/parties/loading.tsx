import { SkeletonBlock } from '@/components/Skeleton'

export default function PartiesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SkeletonBlock className="h-7 w-32 mb-2 animate-pulse" />
      <SkeletonBlock className="h-4 w-44 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
            <SkeletonBlock className="h-12 w-3 flex-shrink-0 rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-3 w-1/3" />
              <SkeletonBlock className="h-3 w-16 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
