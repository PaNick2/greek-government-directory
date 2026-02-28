import { db } from '@/lib/db'
import MinisterCard from '@/components/MinisterCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; party?: string; gov?: string; sort?: string }>
}

export const metadata = {
  title: 'Υπουργοί | Ελληνικό Κυβερνητικό Αρχείο',
}

export default async function MinistersPage({ searchParams }: PageProps) {
  const { q, status, party: partyId, gov: govId, sort } = await searchParams

  const ministers = await db.minister.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { name_en: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
        partyId
          ? { partyTerms: { some: { party_id: partyId } } }
          : {},
        govId
          ? { cabinetRoles: { some: { government_id: govId } } }
          : {},
      ],
    },
    orderBy: sort === 'events' ? undefined : { name: 'asc' },
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
      _count: { select: { events: true } },
    },
  })

  const [parties, governments] = await Promise.all([
    db.party.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.government.findMany({ orderBy: { start_date: 'desc' }, select: { id: true, name: true } }),
  ])

  // Derive active status
  const enriched = ministers.map((m) => ({
    ...m,
    isActive: m.cabinetRoles.some((r) => !r.end_date),
  }))

  const activeCount = enriched.filter((m) => m.isActive).length

  // Filter by status
  const statusFiltered =
    status === 'active'
      ? enriched.filter((m) => m.isActive)
      : status === 'past'
        ? enriched.filter((m) => !m.isActive)
        : enriched

  // Sort
  const filtered = sort === 'events'
    ? [...statusFiltered].sort((a, b) => (b._count?.events ?? 0) - (a._count?.events ?? 0))
    : statusFiltered

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

      {/* Search + Filters */}
      <div className="mb-4 max-w-sm">
        <SearchBar placeholder="Φίλτρο ονόματος..." />
      </div>
      <FilterBar
        parties={parties}
        governments={governments}
        currentParty={partyId}
        currentGov={govId}
        currentStatus={status}
        currentSort={sort}
        q={q}
      />

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
                slug={m.slug}
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
                eventCount={sort === 'events' ? (m._count?.events ?? 0) : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
