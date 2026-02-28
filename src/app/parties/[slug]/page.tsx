import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MinisterCard from '@/components/MinisterCard'
import type { Metadata } from 'next'
import type { PoliticalSpectrum, ParliamentaryStatus } from '@/generated/prisma/enums'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

// ── Badge helpers (same mapping as listing page) ───────────────────────────

const SPECTRUM_LABELS: Record<PoliticalSpectrum, string> = {
  far_left:     'Ακροαριστερά',
  left:         'Αριστερά',
  centre_left:  'Κεντροαριστερά',
  centre:       'Κέντρο',
  centre_right: 'Κεντροδεξιά',
  right:        'Δεξιά',
  far_right:    'Ακροδεξιά',
}

const SPECTRUM_CLASSES: Record<PoliticalSpectrum, string> = {
  far_left:     'bg-red-100 text-red-800',
  left:         'bg-red-50 text-red-700',
  centre_left:  'bg-rose-50 text-rose-700',
  centre:       'bg-slate-100 text-slate-600',
  centre_right: 'bg-blue-50 text-blue-700',
  right:        'bg-blue-100 text-blue-800',
  far_right:    'bg-indigo-100 text-indigo-800',
}

const STATUS_LABELS: Record<ParliamentaryStatus, string> = {
  governing:               'Κυβέρνηση',
  opposition:              'Αντιπολίτευση',
  junior_coalition_partner:'Εταίρος συνασπισμού',
  extra_parliamentary:     'Εξωκοινοβουλευτικό',
  dissolved:               'Διαλύθηκε',
}

const STATUS_CLASSES: Record<ParliamentaryStatus, string> = {
  governing:               'bg-green-100 text-green-800',
  opposition:              'bg-amber-50 text-amber-700',
  junior_coalition_partner:'bg-teal-50 text-teal-700',
  extra_parliamentary:     'bg-slate-100 text-slate-500',
  dissolved:               'bg-gray-100 text-gray-500',
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatYear(d: Date | null | undefined): string | null {
  if (!d) return null
  return String(new Date(d).getFullYear())
}

// ── Static params ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const parties = await db.party.findMany({ select: { slug: true } })
  return parties.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const party = await db.party.findUnique({ where: { slug }, select: { name: true, bio: true } })
  return {
    title: party ? `${party.name} | ΕΚΑ` : 'Κόμμα | ΕΚΑ',
    description: party?.bio?.slice(0, 160) ?? undefined,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PartyDetailPage({ params }: PageProps) {
  const { slug } = await params

  const party = await db.party.findUnique({
    where: { slug },
    include: {
      electionResults: {
        orderBy: { election_date: 'desc' },
      },
      leaders: {
        orderBy: { from: 'asc' },
        include: {
          minister: { select: { id: true, slug: true } },
        },
      },
      partyTerms: {
        orderBy: { from: 'asc' },
        distinct: ['minister_id'],
        include: {
          minister: {
            select: {
              id: true,
              slug: true,
              name: true,
              name_en: true,
              cabinetRoles: {
                orderBy: { start_date: 'desc' },
                take: 1,
                include: { government: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  })

  if (!party) notFound()

  const govSet = new Map<string, string>()
  for (const pt of party.partyTerms) {
    for (const r of pt.minister.cabinetRoles) {
      if (r.government) govSet.set(r.government.name, r.government.name)
    }
  }

  const activeMembers = party.partyTerms.filter((pt) =>
    pt.minister.cabinetRoles.some((r) => !r.end_date)
  ).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/parties" className="hover:text-[#003087]">Κόμματα</Link>
        {' / '}
        <span className="text-slate-800">{party.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 flex items-start gap-4">
        {party.color && (
          <div className="h-16 w-3 flex-shrink-0 rounded-full mt-1" style={{ backgroundColor: party.color }} />
        )}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-900">{party.name}</h1>
            {party.abbreviation && (
              <span className="text-lg font-medium text-slate-400">({party.abbreviation})</span>
            )}
          </div>
          {party.name_en && <p className="text-slate-400 mt-0.5 text-sm">{party.name_en}</p>}

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            {party.political_spectrum && (
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${SPECTRUM_CLASSES[party.political_spectrum]}`}>
                {SPECTRUM_LABELS[party.political_spectrum]}
              </span>
            )}
            {party.parliamentary_status && (
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[party.parliamentary_status]}`}>
                {STATUS_LABELS[party.parliamentary_status]}
              </span>
            )}
          </div>

          {/* Meta stats */}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            <span>{party.partyTerms.length} υπουργοί</span>
            {activeMembers > 0 && <span>{activeMembers} ενεργοί</span>}
            {govSet.size > 0 && <span>{govSet.size} κυβερνήσεις</span>}
            {party.founded && <span>Ίδρυση: {formatYear(party.founded)}</span>}
            {party.dissolved && <span>Διάλυση: {formatYear(party.dissolved)}</span>}
          </div>
        </div>
      </div>

      {/* Bio */}
      {party.bio && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Ιστορία</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{party.bio}</p>
          {party.bio_en && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">Show in English</summary>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{party.bio_en}</p>
            </details>
          )}
        </section>
      )}

      {/* Ideology */}
      {party.ideology && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Ιδεολογία</h2>
          <p className="text-sm text-slate-600">{party.ideology}</p>
          {party.ideology_en && (
            <p className="text-xs text-slate-400 mt-1">{party.ideology_en}</p>
          )}
        </section>
      )}

      {/* Election Results */}
      {party.electionResults.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Εκλογικά Αποτελέσματα
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-medium">Εκλογές</th>
                  <th className="pb-2 pr-4 font-medium text-right">Ποσοστό</th>
                  <th className="pb-2 pr-4 font-medium text-right">Έδρες</th>
                  <th className="pb-2 pr-4 font-medium">Κυβέρνηση</th>
                  <th className="pb-2 font-medium">Σημειώσεις</th>
                </tr>
              </thead>
              <tbody>
                {party.electionResults.map((er) => (
                  <tr key={er.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 pr-4 text-slate-700">
                      {er.source ? (
                        <a href={er.source} target="_blank" rel="noopener noreferrer" className="hover:text-[#003087] transition">
                          {new Date(er.election_date).toLocaleDateString('el-GR', { year: 'numeric', month: 'long' })}
                        </a>
                      ) : (
                        new Date(er.election_date).toLocaleDateString('el-GR', { year: 'numeric', month: 'long' })
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-slate-700">
                      {er.vote_percentage != null ? `${er.vote_percentage.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-slate-700">
                      {er.seats != null
                        ? `${er.seats}${er.total_seats ? ` / ${er.total_seats}` : ''}`
                        : '—'}
                    </td>
                    <td className="py-2 pr-4">
                      {er.formed_government ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">✓ Ναι</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-slate-400">{er.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Leadership Timeline */}
      {party.leaders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Ηγεσία
          </h2>
          <ol className="relative border-l border-slate-200 ml-3">
            {party.leaders.map((leader) => (
              <li key={leader.id} className="mb-6 ml-6">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-300" />
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    {leader.minister ? (
                      <Link
                        href={`/ministers/${leader.minister.slug}`}
                        className="font-medium text-slate-900 hover:text-[#003087] transition"
                      >
                        {leader.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-900">{leader.name}</span>
                    )}
                    {leader.notes && (
                      <p className="text-xs text-slate-400 mt-0.5">{leader.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(leader.from)} — {leader.to ? formatDate(leader.to) : 'σήμερα'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Members grid */}
      {party.partyTerms.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Μέλη
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {party.partyTerms.map((pt) => {
              const m = pt.minister
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
                  partyName={party.name}
                  partyColor={party.color}
                  isActive={isActive}
                />
              )
            })}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-500 text-sm">Δεν υπάρχουν καταχωρημένα μέλη ακόμη.</p>
        </div>
      )}
    </div>
  )
}
