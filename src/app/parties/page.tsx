import { db } from '@/lib/db'
import Link from 'next/link'

export const metadata = {
  title: 'Κόμματα | Ελληνικό Κυβερνητικό Αρχείο',
}

export default async function PartiesPage() {
  const parties = await db.party.findMany({
    orderBy: { name: 'asc' },
    include: {
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
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-[#003087] transition">
                      {party.name}
                    </h3>
                    {party.name_en && (
                      <p className="text-xs text-slate-400 mt-0.5">{party.name_en}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex gap-4 text-xs text-slate-400">
                  <span>{party._count.partyTerms} μέλη</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
