import { SkeletonBlock } from '@/components/Skeleton'

export default function MinisterDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-4" />
        <SkeletonBlock className="h-4 w-40" />
      </div>

      {/* Hero */}
      <div className="mb-8 flex gap-6">
        <SkeletonBlock className="h-24 w-24 flex-shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-4 w-72" />
          <div className="flex gap-4">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SkeletonBlock className="h-5 w-32 mb-3" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-5/6" />
          <SkeletonBlock className="h-3 w-4/5" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/4" />

          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-4 w-16" />
                </div>
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-5 w-40 mb-2" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
                  <SkeletonBlock className="h-3 w-3/4" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
