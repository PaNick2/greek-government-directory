import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const minister = await db.minister.findUnique({ where: { id }, select: { name: true } })
  return { title: minister ? `${minister.name} | ΕΚΑ` : 'Υπουργός | ΕΚΑ' }
}

function constitutionalityBadge(c: string | null) {
  if (!c) return null
  const map: Record<string, { label: string; className: string }> = {
    constitutional: { label: 'Συνταγματικό', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    unconstitutional: { label: 'Αντισυνταγματικό', className: 'bg-red-50 text-red-700 border-red-200' },
    disputed: { label: 'Αμφιβαλλόμενο', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending_ruling: { label: 'Υπό εξέταση', className: 'bg-slate-50 text-slate-600 border-slate-200' },
    not_applicable: { label: 'Μ/Ε', className: 'bg-slate-50 text-slate-400 border-slate-200' },
  }
  const entry = map[c]
  if (!entry) return null
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${entry.className}`}>
      {entry.label}
    </span>
  )
}

function severityDot(s: string | null) {
  if (!s) return null
  const map: Record<string, { label: string; color: string }> = {
    low: { label: 'Χαμηλή', color: 'bg-blue-400' },
    medium: { label: 'Μεσαία', color: 'bg-yellow-400' },
    high: { label: 'Υψηλή', color: 'bg-red-500' },
  }
  const entry = map[s]
  if (!entry) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <span className={`h-2 w-2 rounded-full ${entry.color}`} />
      {entry.label}
    </span>
  )
}

export default async function MinisterDetailPage({ params }: PageProps) {
  const { id } = await params

  const minister = await db.minister.findUnique({
    where: { id },
    include: {
      partyTerms: { orderBy: { from: 'asc' }, include: { party: true } },
      cabinetRoles: {
        orderBy: { start_date: 'asc' },
        include: { government: true, ministry: true },
      },
      education: { orderBy: { year: 'asc' } },
      familyMembers: true,
      events: {
        orderBy: { date: 'desc' },
        include: { sources: true, constitutional_references: true },
      },
      quotes: { orderBy: { date: 'desc' } },
      contradictions: { orderBy: { past_date: 'desc' } },
      assetDeclarations: { orderBy: { year: 'desc' } },
      connectionsFrom: {
        include: { to_minister: { select: { id: true, name: true } } },
      },
    },
  })

  if (!minister) notFound()

  const currentParty = minister.partyTerms.slice().reverse().find((pt) => !pt.to)
    ?? minister.partyTerms.at(-1)

  const currentRole = minister.cabinetRoles
    .slice()
    .reverse()
    .find((r) => !r.end_date) ?? minister.cabinetRoles.at(-1)

  const isActive = minister.cabinetRoles.some((r) => !r.end_date)
  const initials = minister.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/ministers" className="hover:text-[#003087]">Υπουργοί</Link>
        {' / '}
        <span className="text-slate-800">{minister.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div
          className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow"
          style={{ backgroundColor: currentParty?.party?.color ?? '#003087' }}
        >
          {initials}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="text-3xl font-bold text-slate-900">{minister.name}</h1>
            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ενεργός
              </span>
            )}
          </div>

          {minister.name_en && <p className="mt-0.5 text-slate-400">{minister.name_en}</p>}

          {currentRole && (
            <p className="mt-2 text-base text-slate-700">
              {currentRole.role}
              {currentRole.government && (
                <span className="text-slate-500"> — {currentRole.government.name}</span>
              )}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            {minister.born && (
              <span>Γέννηση: {new Date(minister.born).toLocaleDateString('el-GR')}</span>
            )}
            {minister.birthplace && <span>{minister.birthplace}</span>}
            {currentParty && (
              <span>
                Κόμμα:{' '}
                <Link href={`/parties/${currentParty.party.id}`} className="font-medium text-[#003087] hover:underline">
                  {currentParty.party.name}
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Biography */}
      {minister.bio && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Βιογραφία</h2>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{minister.bio}</p>
        </section>
      )}

      {/* Cabinet roles */}
      {minister.cabinetRoles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Κυβερνητικές θέσεις</h2>
          <div className="space-y-2">
            {minister.cabinetRoles.map((r) => (
              <div key={r.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.role}</p>
                  {r.ministry && <p className="text-xs text-slate-500 mt-0.5">{r.ministry.name}</p>}
                  {r.government && (
                    <Link href={`/governments/${r.government.id}`} className="text-xs text-[#003087] hover:underline mt-0.5 block">
                      {r.government.name}
                    </Link>
                  )}
                </div>
                <div className="text-right text-xs text-slate-400 whitespace-nowrap ml-4">
                  {new Date(r.start_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })}
                  {' → '}
                  {r.end_date
                    ? new Date(r.end_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                    : 'Σήμερα'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {minister.events.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Γεγονότα &amp; Αποφάσεις</h2>
          <div className="space-y-3">
            {minister.events.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900">{ev.title}</h3>
                  <div className="flex items-center gap-2">
                    {severityDot(ev.severity)}
                    {constitutionalityBadge(ev.constitutionality)}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {new Date(ev.date).toLocaleDateString('el-GR')}
                </p>
                {ev.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{ev.description}</p>
                )}
                {ev.constitutional_notes && (
                  <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 p-2 text-xs text-amber-800">
                    {ev.constitutional_notes}
                  </div>
                )}
                {ev.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ev.sources.map((s) => (
                      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#003087] hover:underline">
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quotes */}
      {minister.quotes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Δηλώσεις</h2>
          <div className="space-y-3">
            {minister.quotes.map((q) => (
              <blockquote key={q.id} className="rounded-xl border-l-4 border-[#003087] bg-white pl-4 pr-4 py-3">
                <p className="text-sm italic text-slate-700">&ldquo;{q.text}&rdquo;</p>
                <footer className="mt-1 text-xs text-slate-400">
                  {q.date ? new Date(q.date).toLocaleDateString('el-GR') : ''}
                  {q.context && ` — ${q.context}`}
                  {q.source && (
                    <> · <a href={q.source} className="text-[#003087] hover:underline" target="_blank" rel="noopener noreferrer">Πηγή</a></>
                  )}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Contradictions */}
      {minister.contradictions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Αντιφάσεις</h2>
          <div className="space-y-3">
            {minister.contradictions.map((c) => (
              <div key={c.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">{c.topic}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      {c.past_date ? new Date(c.past_date).toLocaleDateString('el-GR') : '—'}
                    </p>
                    <p className="text-slate-700">&ldquo;{c.past_position}&rdquo;</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      {c.current_date ? new Date(c.current_date).toLocaleDateString('el-GR') : '—'}
                    </p>
                    <p className="text-slate-700">&ldquo;{c.current_position}&rdquo;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {minister.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Εκπαίδευση</h2>
          <div className="space-y-2">
            {minister.education.map((e) => (
              <div key={e.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#003087]" />
                <div>
                  <span className="font-medium text-slate-800">{e.degree}</span>
                  <span className="text-slate-500"> — {e.institution}</span>
                  {e.year && <span className="text-slate-400"> ({e.year})</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Asset declarations */}
      {minister.assetDeclarations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Δηλώσεις Πόθεν Έσχες</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-2 pr-4">Έτος</th>
                  <th className="pb-2 pr-4">Δηλωθείσα αξία</th>
                  <th className="pb-2">Πηγή</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {minister.assetDeclarations.map((ad) => (
                  <tr key={ad.id}>
                    <td className="py-2 pr-4 font-medium">{ad.year}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {ad.declared_value_eur != null
                        ? `€${Number(ad.declared_value_eur).toLocaleString('el-GR')}`
                        : '—'}
                    </td>
                    <td className="py-2">
                      {ad.source ? (
                        <a href={ad.source} target="_blank" rel="noopener noreferrer"
                          className="text-[#003087] hover:underline text-xs">Προβολή</a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
