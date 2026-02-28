import { db } from '@/lib/db'
import Link from 'next/link'

// Built once at deploy time; regenerate by running `npm run build`
export const dynamic = 'force-static'

export const metadata = {
  title: 'Κυβερνήσεις | Ελληνικό Κυβερνητικό Αρχείο',
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
}

function duration(start: Date, end: Date | null): string {
  const to = end ?? new Date()
  const months =
    (to.getFullYear() - start.getFullYear()) * 12 +
    (to.getMonth() - start.getMonth())
  if (months < 1) return '< 1 μήνας'
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(`${y} έτ.`)
  if (m > 0) parts.push(`${m} μη.`)
  return parts.join(' ')
}

export default async function GovernmentsPage() {
  // Fetch ALL parliamentary election results across all parties
  const allParliamentary = await db.electionResult.findMany({
    where: { election_type: 'parliamentary' },
    orderBy: { election_date: 'desc' },
    include: {
      party: { select: { id: true, name: true, abbreviation: true, color: true } },
    },
  })

  // Group by election_date → one entry per national election date
  // For each date: prefer the party with formed_government:true, else pick largest by seats
  const byDate = new Map<string, typeof allParliamentary>()
  for (const er of allParliamentary) {
    const key = er.election_date.toISOString().slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(er)
  }

  const elections = Array.from(byDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // newest first
    .map(([, results]) => {
      const winner =
        results.find((r) => r.formed_government) ??
        results.sort((a, b) => (b.seats ?? 0) - (a.seats ?? 0))[0]
      return { winner, formedGov: results.some((r) => r.formed_government) }
    })

  // Detail enrichment: Government rows with PM info
  const governments = await db.government.findMany({
    include: {
      prime_minister: { select: { id: true, name: true, slug: true } },
      _count: { select: { cabinetRoles: true } },
    },
  })

  // Match Government row to election: start_date within 120 days after election_date
  function findGov(electionDate: Date) {
    const from = electionDate.getTime()
    const to = from + 120 * 24 * 60 * 60 * 1000
    return governments.find((g) => {
      const t = new Date(g.start_date).getTime()
      return t >= from && t <= to
    }) ?? null
  }

  // Term end = the date of the next (more recent) election in the sorted list
  function termEnd(idx: number): Date | null {
    const newer = elections[idx - 1]
    return newer ? new Date(newer.winner.election_date) : null
  }

  const FALLBACK = '#94a3b8'

  // Legend: unique parties, oldest first + count of times each formed government
  const seenIds = new Set<string>()
  const legendParties: typeof elections[0]['winner']['party'][] = []
  const govCount = new Map<string, number>()
  for (const { winner, formedGov } of [...elections].reverse()) {
    if (formedGov) {
      govCount.set(winner.party.id, (govCount.get(winner.party.id) ?? 0) + 1)
      if (!seenIds.has(winner.party.id)) {
        seenIds.add(winner.party.id)
        legendParties.push(winner.party)
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Κυβερνήσεις</h1>
      <p className="mb-6 text-sm text-slate-500">
        {elections.length} εθνικές εκλογές · 1974 – σήμερα
      </p>

      {/* Legend */}
      {legendParties.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {legendParties.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: p.color ?? FALLBACK }}
            >
              {p.abbreviation ?? p.name}
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white/25 px-1 text-[10px] font-bold tabular-nums">
                {govCount.get(p.id) ?? 0}
              </span>
            </span>
          ))}
        </div>
      )}

      {elections.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">Δεν υπάρχουν δεδομένα εκλογών ακόμη.</p>
        </div>
      ) : (
        <div className="relative ml-4">
          {/* Vertical rule */}
          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-200" />

          {elections.map(({ winner: er, formedGov }, idx) => {
            const color = formedGov ? (er.party.color ?? FALLBACK) : FALLBACK
            const electionDate = new Date(er.election_date)
            const end = termEnd(idx)
            const gov = formedGov ? findGov(electionDate) : null

            return (
              <div key={er.id} className="relative pl-8 pb-6">
                {/* Timeline dot */}
                <div
                  className="absolute left-[-5px] top-3 h-3 w-3 rounded-full border-2 border-white ring-1 ring-slate-200"
                  style={{ backgroundColor: color }}
                />

                <div
                  className="rounded-xl border border-slate-200 bg-white p-4"
                  style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Party badge — only if they formed a government */}
                      {formedGov && (
                        <span
                          className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: color }}
                        >
                          {er.party.abbreviation ?? er.party.name}
                        </span>
                      )}

                      <h3 className="font-semibold text-slate-900 leading-snug">
                        {formedGov ? er.party.name : 'Εκλογές — κυβέρνηση δεν σχηματίστηκε'}
                      </h3>

                      {/* Election stats */}
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                        {er.vote_percentage != null && formedGov && (
                          <span>{er.vote_percentage.toFixed(1)}%</span>
                        )}
                        {er.seats != null && er.total_seats != null && formedGov && (
                          <span>{er.seats}/{er.total_seats} έδρες</span>
                        )}
                      </div>

                      {/* Government detail */}
                      {gov ? (
                        <div className="mt-2 flex items-center gap-3">
                          {gov.prime_minister && (
                            <Link
                              href={`/ministers/${gov.prime_minister.slug}`}
                              className="text-sm font-medium text-slate-700 hover:text-[#003087] transition"
                            >
                              ΠΘ: {gov.prime_minister.name}
                            </Link>
                          )}
                          <Link
                            href={`/governments/${gov.id}`}
                            className="text-xs text-slate-400 hover:text-[#003087] transition"
                          >
                            Δείτε την κυβέρνηση →
                          </Link>
                        </div>
                      ) : formedGov ? (
                        <p className="mt-2 text-xs text-slate-300 italic">
                          Στοιχεία κυβέρνησης δεν έχουν εισαχθεί ακόμη
                        </p>
                      ) : null}
                    </div>

                    {/* Date + duration */}
                    <div className="shrink-0 text-right text-xs text-slate-400">
                      <div className="whitespace-nowrap font-medium">
                        {fmtDate(electionDate)}
                      </div>
                      {formedGov && (
                        <>
                          <div className="mt-0.5 text-slate-300">
                            {fmtDate(electionDate)} – {end ? fmtDate(end) : 'Σήμερα'}
                          </div>
                          <div className="mt-0.5 text-slate-300">
                            {duration(electionDate, end)}
                          </div>
                          {gov && (
                            <div className="mt-0.5 text-slate-300">
                              {gov._count.cabinetRoles} θέσεις
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Bottom terminus */}
          <div className="relative pl-8 pb-2">
            <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full border-2 border-white bg-slate-400 ring-1 ring-slate-200" />
            <p className="pt-1 text-xs text-slate-400 italic">
              Αποκατάσταση Δημοκρατίας · Ιούλιος 1974
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
