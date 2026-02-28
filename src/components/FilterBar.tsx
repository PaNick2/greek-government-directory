'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface FilterBarProps {
  parties: { id: string; name: string }[]
  governments: { id: string; name: string }[]
  currentParty?: string
  currentGov?: string
  currentStatus?: string
  currentSort?: string
  q?: string
}

export default function FilterBar({
  parties,
  governments,
  currentParty,
  currentGov,
  currentStatus,
  currentSort,
  q,
}: FilterBarProps) {
  const router = useRouter()
  useSearchParams() // keep reactive

  function build(overrides: Record<string, string | undefined>) {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (currentStatus) params.status = currentStatus
    if (currentParty) params.party = currentParty
    if (currentGov) params.gov = currentGov
    if (currentSort) params.sort = currentSort
    Object.assign(params, overrides)
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k] })
    const qs = new URLSearchParams(params).toString()
    router.push(`/ministers${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm">
        {([
          { value: '', label: 'Όλοι' },
          { value: 'active', label: 'Ενεργοί' },
          { value: 'past', label: 'Πρώην' },
        ] as { value: string; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => build({ status: value || undefined, sort: currentSort })}
            className={`rounded px-3 py-1.5 font-medium transition ${
              (currentStatus ?? '') === value
                ? 'bg-[#003087] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Party filter */}
      {parties.length > 0 && (
        <select
          value={currentParty ?? ''}
          onChange={(e) => build({ party: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003087] outline-none"
        >
          <option value="">Όλα τα κόμματα</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}

      {/* Government filter */}
      {governments.length > 0 && (
        <select
          value={currentGov ?? ''}
          onChange={(e) => build({ gov: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003087] outline-none"
        >
          <option value="">Όλες οι κυβερνήσεις</option>
          {governments.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      )}

      {/* Sort */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm">
        {([
          { value: '', label: 'Α–Ω' },
          { value: 'events', label: 'Γεγονότα ↓' },
        ] as { value: string; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => build({ sort: value || undefined })}
            className={`rounded px-3 py-1.5 font-medium transition ${
              (currentSort ?? '') === value
                ? 'bg-[#003087] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
