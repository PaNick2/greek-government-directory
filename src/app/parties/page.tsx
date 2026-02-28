import { db } from '@/lib/db'
import Link from 'next/link'
import type { PoliticalSpectrum, ParliamentaryStatus } from '@/generated/prisma/enums'

export const revalidate = 3600

export const metadata = {
  title: 'Κόμματα | Ελληνικό Κυβερνητικό Αρχείο',
}

// ── Badge helpers ──────────────────────────────────────────────────────────

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
  junior_coalition_partner:'Εταίρος',
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

export default async function PartiesPage() {
  const parties = await db.party.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      name_en: true,
      abbreviation: true,
      color: true,
      founded: true,
      political_spectrum: true,
      parliamentary_status: true,
      _count: { select: { partyTerms: true } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Κόμματα</h1>
      <p className="mb-8 text-sm text-slate-500">
        {parties.length} κόμματα καταχωρημένα
      </p>

      {parties.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">Δεν υπάρχουν καταχωρημένα κόμματα ακόμη.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {parties.map((party) => (
            <Link
              key={party.id}
              href={`/parties/${party.id}`}
              className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-[#003087] hover:shadow-sm transition"
            >
              {party.color && (
                <div
                  className="mt-0.5 h-12 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#003087] transition">
                    {party.name}
                  </h3>
                  {party.abbreviation && (
                    <span className="text-xs font-medium text-slate-400">({party.abbreviation})</span>
                  )}
                </div>

                {/* Badges row */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {party.political_spectrum && (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SPECTRUM_CLASSES[party.political_spectrum]}`}>
                      {SPECTRUM_LABELS[party.political_spectrum]}
                    </span>
                  )}
                  {party.parliamentary_status && (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[party.parliamentary_status]}`}>
                      {STATUS_LABELS[party.parliamentary_status]}
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div className="mt-2 flex gap-4 text-xs text-slate-400">
                  <span>{party._count.partyTerms} μέλη</span>
                  {party.founded && (
                    <span>ιδρ. {new Date(party.founded).getFullYear()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
