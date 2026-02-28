import { db } from '@/lib/db'
import MinisterCard from '@/components/MinisterCard'
import SearchBar from '@/components/SearchBar'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; party?: string }>
}

export const metadata = {
  title: 'Υπουργοί | Ελληνικό Κυβερνητικό Αρχείο',
}

export default async function MinistersPage({ searchParams }: PageProps) {
  const { q, status, party: partyId } = await searchParams

  const ministers = await db.minister.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { name_en: { contains: q } },
              ],
            }
          : {},
        partyId
          ? { partyTerms: { some: { party_id: partyId } } }
          : {},
      ],
    },
    orderBy: { name: 'asc' },
    include: {
      partyTerms: {
        orderBy: { from: 'desc' },
        take: 1,
        include: { party: true },
      },
      cabinetRoles: {
        orderBy: { start_date: 'desc' },
        take: 1,
        include: { government: true },
      },
    },
  })

  const parties = await db.party.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  // Derive active status: has a cabinet role with no end_date
  const enriched = ministers.map((m) => ({
    ...m,
    isActive: m.cabinetRoles.some((r) => !r.end_date),
  }))

  const activeCount = enriched.filter((m) => m.isActive).length

  // Filter by status after query (no isCurrentlyServing column)
  const filtered =
    status === 'active'
      ? enriched.filter((m) => m.isActive)
      : status === 'past'
        ? enriched.filter((m) => !m.isActive)
        : enriched

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Υπουργοί</h1>
        <p className="mt-1 text-sm text-slate-500">
          {filtered.length} αποτέλεσμα{filtered.length !== 1 ? 'τα' : ''} —{' '}
          {activeCount} ενεργοί
        </p>
      </div>

      {/* Filters row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-sm">
          <SearchBar placeholder="Φίλτρο ονόματος..." />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm">
          {[
            { value: '', label: 'Όλοι' },
            { value: 'active', label: 'Ενεργοί' },
            { value: 'past', label: 'Πρώην' },
          ].map(({ value, label }) => (
            <a
              key={value}
              href={`/ministers?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(value ? { status: value } : {}),
                ...(partyId ? { party: partyId } : {}),
              })}`}
              className={`rounded px-3 py-1.5 font-medium transition ${
                (status ?? '') === value
                  ? 'bg-[#003087] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Party filter */}
        {parties.length > 0 && (
          <form method="get" action="/ministers">
            {q && <input type="hidden" name="q" value={q} />}
            {status && <input type="hidden" name="status" value={status} />}
            <select
              name="party"
              defaultValue={partyId ?? ''}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#003087] outline-none"
            >
              <option value="">Όλα τα κόμματα</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </form>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">
            {q
              ? `Δεν βρέθηκαν αποτελέσματα για «${q}»`
              : 'Δεν υπάρχουν καταχωρημένοι υπουργοί ακόμη.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => {
            const lastParty = m.partyTerms[0]?.party
            const lastRole = m.cabinetRoles[0]
            return (
              <MinisterCard
                key={m.id}
                id={m.id}
                name={m.name}
                nameEn={m.name_en}
                currentRole={
                  lastRole
                    ? `${lastRole.role}${lastRole.government ? ` — ${lastRole.government.name}` : ''}`
                    : null
                }
                partyName={lastParty?.name ?? null}
                partyColor={lastParty?.color ?? null}
                isActive={m.isActive}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
