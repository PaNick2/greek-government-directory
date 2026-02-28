import { MinisterCardSkeleton, SkeletonBlock } from '@/components/Skeleton'

export default function PartyDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 flex gap-2">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-4" />
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="mb-8 flex items-start gap-4">
        <SkeletonBlock className="h-16 w-3 flex-shrink-0 rounded-full" />
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-48" />
          <div className="flex gap-4">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      </div>
      <SkeletonBlock className="h-5 w-24 mb-4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MinisterCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
