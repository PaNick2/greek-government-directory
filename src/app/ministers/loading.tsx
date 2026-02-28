import { MinisterCardSkeleton } from '@/components/Skeleton'

export default function MinistersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="animate-pulse h-7 w-32 rounded bg-slate-200 mb-2" />
        <div className="animate-pulse h-4 w-48 rounded bg-slate-200" />
      </div>
      <div className="mb-6 flex gap-3">
        <div className="animate-pulse h-10 w-64 rounded-lg bg-slate-200" />
        <div className="animate-pulse h-10 w-40 rounded-lg bg-slate-200" />
        <div className="animate-pulse h-10 w-40 rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MinisterCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
