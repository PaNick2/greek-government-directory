import { db } from '@/lib/db'
import Link from 'next/link'

export const revalidate = 3600

export const metadata = {
  title: 'Κυβερνήσεις | Ελληνικό Κυβερνητικό Αρχείο',
}

export default async function GovernmentsPage() {
  const governments = await db.government.findMany({
    orderBy: [{ start_date: 'desc' }],
    include: {
      prime_minister: { select: { id: true, name: true } },
      _count: { select: { cabinetRoles: true } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Κυβερνήσεις</h1>
      <p className="mb-8 text-sm text-slate-500">
        {governments.length} κυβερνήσεις καταχωρημένες
      </p>

      {governments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">Δεν υπάρχουν καταχωρημένες κυβερνήσεις ακόμη.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {governments.map((gov) => (
            <Link
              key={gov.id}
              href={`/governments/${gov.id}`}
              className="group flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-[#003087] hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#003087] transition">
                    {gov.name}
                  </h3>
                  {gov.prime_minister && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      ΠΘ: {gov.prime_minister.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 whitespace-nowrap ml-4">
                <div>
                  {gov.start_date
                    ? new Date(gov.start_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                    : '—'}
                  {' → '}
                  {gov.end_date
                    ? new Date(gov.end_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                    : 'Σήμερα'}
                </div>
                <div className="mt-1 text-slate-300">
                  {gov._count.cabinetRoles} θέσεις
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
