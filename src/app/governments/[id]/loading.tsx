import { SkeletonBlock } from '@/components/Skeleton'

export default function GovernmentDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 flex gap-2">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-4 w-4" />
        <SkeletonBlock className="h-4 w-48" />
      </div>
      <div className="mb-8 space-y-3">
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-4 w-56" />
        <div className="flex gap-4">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBlock className="h-6 w-48 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <SkeletonBlock className="h-4 w-40 mb-3" />
            <div className="space-y-1.5">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                  <SkeletonBlock className="h-3 w-48" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
