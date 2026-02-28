import { db } from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import MinisterCard from '@/components/MinisterCard'
import Link from 'next/link'

async function getStats() {
  const [ministerCount, governmentCount, eventCount, partyCount] =
    await Promise.all([
      db.minister.count(),
      db.government.count(),
      db.event.count(),
      db.party.count(),
    ])
  return { ministerCount, governmentCount, eventCount, partyCount }
}

async function getRecentMinisters() {
  return db.minister.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
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
}

export default async function HomePage() {
  const [stats, ministers] = await Promise.all([
    getStats(),
    getRecentMinisters(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#003087] text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ελληνικό Κυβερνητικό Αρχείο
          </h1>
          <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
            Αναζητήστε στοιχεία για Έλληνες υπουργούς, κυβερνήσεις, αποφάσεις
            και συνταγματικότητα ενεργειών.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <SearchBar
              placeholder="Αναζήτηση υπουργού, κυβέρνησης..."
              size="lg"
            />
          </div>

          <p className="mt-4 text-xs text-blue-300">
            Πληκτρολογήστε Enter για πλήρη αναζήτηση
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Υπουργοί', value: stats.ministerCount },
              { label: 'Κυβερνήσεις', value: stats.governmentCount },
              { label: 'Κόμματα', value: stats.partyCount },
              { label: 'Γεγονότα', value: stats.eventCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 px-6 py-4 text-center"
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 text-3xl font-bold text-[#003087]">
                  {value.toLocaleString('el-GR')}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Ministers grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Τελευταίες προσθήκες
          </h2>
          <Link
            href="/ministers"
            className="text-sm font-medium text-[#003087] hover:underline"
          >
            Όλοι οι υπουργοί →
          </Link>
        </div>

        {ministers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-500 text-sm">
              Δεν έχουν εισαχθεί ακόμη δεδομένα.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Χρησιμοποιήστε το{' '}
              <code className="bg-slate-100 px-1 rounded text-slate-600">
                npm run import
              </code>{' '}
              για εισαγωγή δεδομένων.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ministers.map((m) => {
              const lastParty = m.partyTerms[0]?.party
              const lastRole = m.cabinetRoles[0]
              const isActive = m.cabinetRoles.some((r) => !r.end_date)
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
                  isActive={isActive}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Browse sections */}
      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Περιήγηση
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                href: '/governments',
                title: 'Κυβερνήσεις',
                desc: 'Χρονολογία κυβερνήσεων από 1974 έως σήμερα.',
                icon: '🏛️',
              },
              {
                href: '/parties',
                title: 'Κόμματα',
                desc: 'Πολιτικά κόμματα και η εκπροσώπησή τους.',
                icon: '⚖️',
              },
              {
                href: '/ministers',
                title: 'Υπουργοί',
                desc: 'Κατάλογος όλων των Ελλήνων υπουργών.',
                icon: '👤',
              },
            ].map(({ href, title, desc, icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 p-5 hover:border-[#003087] hover:shadow-sm transition"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#003087] transition">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
