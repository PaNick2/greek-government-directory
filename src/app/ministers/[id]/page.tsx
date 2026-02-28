import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const minister = await db.minister.findUnique({ where: { id }, select: { name: true } })
  return { title: minister ? `${minister.name} | ΕΚΑ` : 'Υπουργός | ΕΚΑ' }
}

const CONSTITUTIONALITY_MAP: Record<string, { label: string; className: string }> = {
  constitutional: { label: 'Συνταγματικό', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unconstitutional: { label: 'Αντισυνταγματικό', className: 'bg-red-50 text-red-700 border-red-200' },
  disputed: { label: 'Αμφισβητούμενο', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending_ruling: { label: 'Υπό εξέταση', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  not_applicable: { label: 'Μ/Ε', className: 'bg-slate-50 text-slate-400 border-slate-200' },
}

const SEVERITY_MAP: Record<string, { label: string; dot: string }> = {
  low: { label: 'Χαμηλή', dot: 'bg-blue-400' },
  medium: { label: 'Μεσαία', dot: 'bg-yellow-400' },
  high: { label: 'Υψηλή', dot: 'bg-red-500' },
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  vote: 'Ψηφοφορία', scandal: 'Σκάνδαλο', legal: 'Νομικό', statement: 'Δήλωση',
  achievement: 'Επίτευγμα', appointment: 'Διορισμός', financial: 'Οικονομικό', media: 'Μέσα Ενημέρωσης',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">{children}</h2>
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
      parliamentaryTerms: { orderBy: { from: 'asc' } },
      committees: { orderBy: { from: 'asc' } },
      billsProposed: { orderBy: { date: 'desc' } },
      businessInterests: { orderBy: { from: 'asc' } },
      mediaTies: true,
      policyPositions: true,
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
  const currentRole = minister.cabinetRoles.slice().reverse().find((r) => !r.end_date)
    ?? minister.cabinetRoles.at(-1)
  const isActive = minister.cabinetRoles.some((r) => !r.end_date)
  const initials = minister.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')

  // Split events by constitutionality interest
  const constitutionalEvents = minister.events.filter(
    (e) => e.constitutionality && e.constitutionality !== 'not_applicable'
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/ministers" className="hover:text-[#003087]">Υπουργοί</Link>
        {' / '}
        <span className="text-slate-800">{minister.name}</span>
      </nav>

      {/* ── Hero ── */}
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
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ενεργός
              </span>
            )}
          </div>
          {minister.name_en && <p className="mt-0.5 text-slate-400">{minister.name_en}</p>}
          {currentRole && (
            <p className="mt-2 text-base text-slate-700">
              {currentRole.role}
              {currentRole.government && <span className="text-slate-500"> — {currentRole.government.name}</span>}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            {minister.born && <span>Γέννηση: {new Date(minister.born).toLocaleDateString('el-GR')}</span>}
            {minister.birthplace && <span>{minister.birthplace}</span>}
            {currentParty && (
              <span>Κόμμα: <Link href={`/parties/${currentParty.party.id}`} className="font-medium text-[#003087] hover:underline">{currentParty.party.name}</Link></span>
            )}
            {minister.parliamentaryTerms.length > 0 && (
              <span>{minister.parliamentaryTerms.length} βουλευτικές θητείες</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left column: accountability data */}
        <div className="space-y-8 lg:col-span-2">

          {/* Biography */}
          {minister.bio && (
            <section>
              <SectionHeading>Βιογραφία</SectionHeading>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{minister.bio}</p>
            </section>
          )}

          {/* Constitutional events — highlighted */}
          {constitutionalEvents.length > 0 && (
            <section>
              <SectionHeading>Συνταγματικά Ζητήματα ({constitutionalEvents.length})</SectionHeading>
              <div className="space-y-4">
                {constitutionalEvents.map((ev) => {
                  const badge = ev.constitutionality ? CONSTITUTIONALITY_MAP[ev.constitutionality] : null
                  const sev = ev.severity ? SEVERITY_MAP[ev.severity] : null
                  return (
                    <div key={ev.id} className={`rounded-xl border p-4 ${
                      ev.constitutionality === 'unconstitutional'
                        ? 'border-red-200 bg-red-50'
                        : ev.constitutionality === 'disputed'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-white'
                    }`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs rounded bg-slate-100 px-2 py-0.5 text-slate-500">
                            {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                          </span>
                          {badge && (
                            <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          )}
                          {sev && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <span className={`h-2 w-2 rounded-full ${sev.dot}`} />
                              {sev.label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString('el-GR')}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">{ev.title}</h3>
                      {ev.description && <p className="text-sm text-slate-600 leading-relaxed">{ev.description}</p>}
                      {ev.constitutional_notes && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                          <p className="font-semibold mb-1">⚖️ Συνταγματική ανάλυση</p>
                          <p className="leading-relaxed">{ev.constitutional_notes}</p>
                        </div>
                      )}
                      {ev.constitutional_court_ruling && (
                        <div className="mt-2 text-xs text-slate-600">
                          <span className="font-medium">Απόφαση: </span>{ev.constitutional_court_ruling}
                        </div>
                      )}
                      {ev.constitutional_references.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {ev.constitutional_references.map((ref) => (
                            <span key={ref.id} className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600" title={ref.description ?? undefined}>
                              {ref.article}{ref.constitution_year ? ` (Σ.${ref.constitution_year})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {ev.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                          {ev.sources.map((s) => (
                            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#003087] hover:underline">{s.label}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* All events */}
          {minister.events.filter(e => !e.constitutionality || e.constitutionality === 'not_applicable').length > 0 && (
            <section>
              <SectionHeading>Γεγονότα &amp; Αποφάσεις</SectionHeading>
              <div className="space-y-3">
                {minister.events.filter(e => !e.constitutionality || e.constitutionality === 'not_applicable').map((ev) => {
                  const sev = ev.severity ? SEVERITY_MAP[ev.severity] : null
                  return (
                    <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs rounded bg-slate-100 px-2 py-0.5 text-slate-500">
                            {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                          </span>
                          {sev && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <span className={`h-2 w-2 rounded-full ${sev.dot}`} />
                              {sev.label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString('el-GR')}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{ev.title}</h3>
                      {ev.description && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{ev.description}</p>}
                      {ev.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ev.sources.map((s) => (
                            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#003087] hover:underline">{s.label}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Contradictions */}
          {minister.contradictions.length > 0 && (
            <section>
              <SectionHeading>Αντιφάσεις ({minister.contradictions.length})</SectionHeading>
              <div className="space-y-3">
                {minister.contradictions.map((c) => (
                  <div key={c.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">{c.topic}</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                      <div className="rounded-lg bg-white border border-amber-100 p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          {c.past_date ? new Date(c.past_date).toLocaleDateString('el-GR') : 'Παλαιότερα'}
                        </p>
                        <p className="text-slate-700 italic">&ldquo;{c.past_position}&rdquo;</p>
                      </div>
                      <div className="rounded-lg bg-white border border-amber-100 p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          {c.current_date ? new Date(c.current_date).toLocaleDateString('el-GR') : 'Πρόσφατα'}
                        </p>
                        <p className="text-slate-700 italic">&ldquo;{c.current_position}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quotes */}
          {minister.quotes.length > 0 && (
            <section>
              <SectionHeading>Δηλώσεις ({minister.quotes.length})</SectionHeading>
              <div className="space-y-3">
                {minister.quotes.map((q) => (
                  <blockquote key={q.id} className="rounded-xl border border-slate-200 border-l-4 border-l-[#003087] bg-white pl-4 pr-4 py-3">
                    <p className="text-sm italic text-slate-700">&ldquo;{q.text}&rdquo;</p>
                    <footer className="mt-1.5 text-xs text-slate-400">
                      {q.date ? new Date(q.date).toLocaleDateString('el-GR') : ''}
                      {q.context && ` — ${q.context}`}
                      {q.source && <> · <a href={q.source} className="text-[#003087] hover:underline" target="_blank" rel="noopener noreferrer">Πηγή</a></>}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Business interests */}
          {minister.businessInterests.length > 0 && (
            <section>
              <SectionHeading>Επιχειρηματικά Συμφέροντα</SectionHeading>
              <div className="space-y-2">
                {minister.businessInterests.map((b) => (
                  <div key={b.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{b.company}</p>
                      {b.role && <p className="text-xs text-slate-500 mt-0.5">{b.role}</p>}
                      {b.notes && <p className="text-xs text-slate-400 mt-0.5">{b.notes}</p>}
                    </div>
                    <div className="text-right text-xs text-slate-400 whitespace-nowrap ml-4">
                      {b.from ? new Date(b.from).toLocaleDateString('el-GR', { year: 'numeric' }) : ''}
                      {(b.from || b.to) && ' → '}
                      {b.to ? new Date(b.to).toLocaleDateString('el-GR', { year: 'numeric' }) : (b.from ? 'σήμερα' : '')}
                      {b.source && <div><a href={b.source} target="_blank" rel="noopener noreferrer" className="text-[#003087] hover:underline">Πηγή</a></div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Media ties */}
          {minister.mediaTies.length > 0 && (
            <section>
              <SectionHeading>Σχέσεις με ΜΜΕ</SectionHeading>
              <div className="space-y-2">
                {minister.mediaTies.map((m) => (
                  <div key={m.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.media_outlet}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.nature}</p>
                    </div>
                    {m.source && (
                      <a href={m.source} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#003087] hover:underline ml-4 whitespace-nowrap">Πηγή</a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column: facts & relations */}
        <div className="space-y-6">

          {/* Cabinet roles */}
          {minister.cabinetRoles.length > 0 && (
            <section>
              <SectionHeading>Κυβερνητικές θέσεις</SectionHeading>
              <div className="space-y-2">
                {minister.cabinetRoles.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-xs font-medium text-slate-900">{r.role}</p>
                    {r.government && (
                      <Link href={`/governments/${r.government.id}`} className="text-xs text-[#003087] hover:underline mt-0.5 block">
                        {r.government.name}
                      </Link>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(r.start_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })}
                      {' → '}
                      {r.end_date ? new Date(r.end_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' }) : 'Σήμερα'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Party history */}
          {minister.partyTerms.length > 0 && (
            <section>
              <SectionHeading>Κομματική ιστορία</SectionHeading>
              <div className="space-y-2">
                {minister.partyTerms.map((pt) => (
                  <div key={pt.id} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: pt.party.color ?? '#003087' }} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/parties/${pt.party.id}`} className="text-xs font-medium text-slate-800 hover:text-[#003087] truncate block">{pt.party.name}</Link>
                      <p className="text-xs text-slate-400">
                        {pt.from ? new Date(pt.from).toLocaleDateString('el-GR', { year: 'numeric' }) : ''}
                        {pt.to ? ` → ${new Date(pt.to).toLocaleDateString('el-GR', { year: 'numeric' })}` : ' → σήμερα'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Parliamentary terms */}
          {minister.parliamentaryTerms.length > 0 && (
            <section>
              <SectionHeading>Βουλευτικές θητείες</SectionHeading>
              <div className="space-y-1.5">
                {minister.parliamentaryTerms.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs text-slate-600">
                    <span>{t.constituency ?? 'Εθνική Περιφέρεια'}</span>
                    <span className="text-slate-400">{t.from} – {t.to ?? '…'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Policy positions */}
          {minister.policyPositions.length > 0 && (
            <section>
              <SectionHeading>Πολιτικές θέσεις</SectionHeading>
              <div className="space-y-2">
                {minister.policyPositions.map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">{p.topic}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.position}</p>
                    {p.source && <a href={p.source} target="_blank" rel="noopener noreferrer" className="text-xs text-[#003087] hover:underline">Πηγή</a>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {minister.education.length > 0 && (
            <section>
              <SectionHeading>Εκπαίδευση</SectionHeading>
              <div className="space-y-2">
                {minister.education.map((e) => (
                  <div key={e.id} className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#003087]" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-800">{e.degree}</p>
                      <p className="text-slate-500">{e.institution}{e.year ? ` (${e.year})` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Asset declarations */}
          {minister.assetDeclarations.length > 0 && (
            <section>
              <SectionHeading>Πόθεν Έσχες</SectionHeading>
              <div className="space-y-1.5">
                {minister.assetDeclarations.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{ad.year}</span>
                    <span className="text-slate-500">
                      {ad.declared_value_eur != null
                        ? `€${Number(ad.declared_value_eur).toLocaleString('el-GR')}`
                        : '—'}
                    </span>
                    {ad.source && (
                      <a href={ad.source} target="_blank" rel="noopener noreferrer"
                        className="text-[#003087] hover:underline">Προβολή</a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Family members */}
          {minister.familyMembers.length > 0 && (
            <section>
              <SectionHeading>Οικογένεια</SectionHeading>
              <div className="space-y-2">
                {minister.familyMembers.map((f) => (
                  <div key={f.id} className="text-xs">
                    <p className="font-medium text-slate-800">{f.name} <span className="font-normal text-slate-400">({f.relation})</span></p>
                    {f.political_role && <p className="text-slate-500">{f.political_role}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Connections */}
          {minister.connectionsFrom.length > 0 && (
            <section>
              <SectionHeading>Συνδέσεις</SectionHeading>
              <div className="space-y-1.5">
                {minister.connectionsFrom.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 capitalize">{c.relation_type.replace('_', ' ')}</span>
                    <Link href={`/ministers/${c.to_minister.id}`} className="font-medium text-[#003087] hover:underline">
                      {c.to_minister.name}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

