import Link from 'next/link'

interface MinisterCardProps {
  id: string
  name: string
  nameEn?: string | null
  currentRole?: string | null
  partyName?: string | null
  partyColor?: string | null
  isActive?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function MinisterCard({
  id,
  name,
  nameEn,
  currentRole,
  partyName,
  partyColor,
  isActive,
}: MinisterCardProps) {
  const initials = getInitials(name)
  const avatarBg = partyColor ?? '#003087'

  return (
    <Link
      href={`/ministers/${id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#003087] hover:shadow-md"
    >
      {/* Avatar */}
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow"
          style={{ backgroundColor: avatarBg }}
          aria-label={name}
        >
          {initials}
        </div>

        {isActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ενεργός
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-[#003087] transition">
        {name}
      </h3>
      {nameEn && (
        <p className="text-xs text-slate-400 mt-0.5">{nameEn}</p>
      )}

      {/* Role */}
      {currentRole && (
        <p className="mt-2 text-xs text-slate-600 leading-snug line-clamp-2">
          {currentRole}
        </p>
      )}

      {/* Party badge */}
      {partyName && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: avatarBg }}
          >
            {partyName}
          </span>
        </div>
      )}
    </Link>
  )
}
