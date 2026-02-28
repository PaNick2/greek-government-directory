import { ListRowSkeleton, SkeletonBlock } from '@/components/Skeleton'

export default function GovernmentsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SkeletonBlock className="h-7 w-36 mb-2 animate-pulse" />
      <SkeletonBlock className="h-4 w-48 mb-8 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
