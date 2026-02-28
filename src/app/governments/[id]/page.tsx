import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const gov = await db.government.findUnique({ where: { id }, select: { name: true } })
  return { title: gov ? `${gov.name} | ΕΚΑ` : 'Κυβέρνηση | ΕΚΑ' }
}

export default async function GovernmentDetailPage({ params }: PageProps) {
  const { id } = await params

  const gov = await db.government.findUnique({
    where: { id },
    include: {
      prime_minister: { select: { id: true, name: true } },
      cabinetRoles: {
        orderBy: { start_date: 'asc' },
        include: {
          minister: { select: { id: true, name: true } },
          ministry: { select: { name: true } },
        },
      },
    },
  })

  if (!gov) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/governments" className="hover:text-[#003087]">
          Κυβερνήσεις
        </Link>{' '}
        / <span className="text-slate-800">{gov.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 flex items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{gov.name}</h1>
          {gov.name_en && <p className="text-slate-400 mt-0.5">{gov.name_en}</p>}
          {gov.prime_minister && (
            <p className="mt-2 text-base text-slate-700">
              Πρωθυπουργός:{' '}
              <Link href={`/ministers/${gov.prime_minister.id}`} className="font-medium text-[#003087] hover:underline">
                {gov.prime_minister.name}
              </Link>
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            <span>
              {gov.start_date
                ? new Date(gov.start_date).toLocaleDateString('el-GR')
                : '—'}
              {' → '}
              {gov.end_date
                ? new Date(gov.end_date).toLocaleDateString('el-GR')
                : 'Σήμερα'}
            </span>
          </div>
        </div>
      </div>

      {/* Cabinet */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Υπουργικό Συμβούλιο ({gov.cabinetRoles.length} θέσεις)
        </h2>
        <div className="space-y-2">
          {gov.cabinetRoles.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{r.role}</p>
                {r.ministry && (
                  <p className="text-xs text-slate-500 mt-0.5">{r.ministry.name}</p>
                )}
              </div>
              {r.minister && (
                <Link
                  href={`/ministers/${r.minister.id}`}
                  className="text-sm font-medium text-[#003087] hover:underline ml-4 text-right"
                >
                  {r.minister.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
