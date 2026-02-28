import { db } from '@/lib/db'
import Link from 'next/link'

export const metadata = {
  title: 'Υπουργεία | Ελληνικό Κυβερνητικό Αρχείο',
}

export default async function MinistriesPage() {
  const ministries = await db.ministry.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { cabinetRoles: true } },
      cabinetRoles: {
        orderBy: { start_date: 'desc' },
        take: 1,
        include: {
          minister: { select: { id: true, name: true } },
          government: { select: { name: true } },
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Υπουργεία</h1>
      <p className="mb-8 text-sm text-slate-500">
        {ministries.length} υπουργεία καταχωρημένα
      </p>

      {ministries.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500 text-sm">Δεν υπάρχουν καταχωρημένα υπουργεία ακόμη.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ministries.map((ministry) => {
            const latestRole = ministry.cabinetRoles[0]
            return (
              <Link
                key={ministry.id}
                href={`/ministries/${ministry.id}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-[#003087] hover:shadow-sm transition"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#003087] transition leading-snug">
                    {ministry.name}
                  </h3>
                  {ministry.name_en && (
                    <p className="text-xs text-slate-400 mt-0.5">{ministry.name_en}</p>
                  )}
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div className="text-xs text-slate-400">
                    {ministry._count.cabinetRoles} θητεί{ministry._count.cabinetRoles === 1 ? 'α' : 'ες'}
                  </div>
                  {latestRole?.minister && (
                    <div className="text-right text-xs text-slate-400">
                      <span className="text-slate-500 font-medium">{latestRole.minister.name}</span>
                      {latestRole.government && (
                        <span className="block text-slate-300">{latestRole.government.name}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
