import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600

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
        orderBy: [{ ministry_id: 'asc' }, { start_date: 'asc' }],
        include: {
          minister: { select: { id: true, name: true } },
          ministry: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!gov) notFound()

  // Group cabinet roles by ministry
  const byMinistry = new Map<string, {
    ministryId: string | null
    ministryName: string
    roles: typeof gov.cabinetRoles
  }>()

  for (const role of gov.cabinetRoles) {
    const key = role.ministry?.id ?? '__no_ministry__'
    const label = role.ministry?.name ?? 'Άλλες θέσεις'
    if (!byMinistry.has(key)) {
      byMinistry.set(key, { ministryId: role.ministry?.id ?? null, ministryName: label, roles: [] })
    }
    byMinistry.get(key)!.roles.push(role)
  }

  const ministryGroups = Array.from(byMinistry.values())
  const uniqueMinisters = new Set(gov.cabinetRoles.map((r) => r.minister_id)).size

  // Duration in months
  const durationMonths = gov.start_date && gov.end_date
    ? Math.round((gov.end_date.getTime() - gov.start_date.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/governments" className="hover:text-[#003087]">Κυβερνήσεις</Link>
        {' / '}
        <span className="text-slate-800">{gov.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
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
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>
            {gov.start_date ? new Date(gov.start_date).toLocaleDateString('el-GR') : '—'}
            {' → '}
            {gov.end_date ? new Date(gov.end_date).toLocaleDateString('el-GR') : 'Σήμερα'}
          </span>
          {durationMonths !== null && <span>{durationMonths} μήνες</span>}
          <span>{uniqueMinisters} υπουργοί</span>
          <span>{gov.cabinetRoles.length} θέσεις</span>
        </div>
      </div>

      {/* Cabinet grouped by ministry */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Υπουργικό Συμβούλιο
        </h2>
        <div className="space-y-6">
          {ministryGroups.map(({ ministryId, ministryName, roles }) => (
            <div key={ministryId ?? '__no_ministry__'}>
              <div className="mb-2 flex items-center gap-2">
                {ministryId ? (
                  <Link href={`/ministries/${ministryId}`}
                    className="text-sm font-semibold text-[#003087] hover:underline">
                    {ministryName}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-slate-600">{ministryName}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {roles.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                    <div>
                      <p className="text-xs text-slate-500">{r.role}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                        {new Date(r.start_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })}
                        {r.end_date ? ` → ${new Date(r.end_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })}` : ' → Σήμερα'}
                      </span>
                      {r.minister && (
                        <Link href={`/ministers/${r.minister.id}`}
                          className="text-sm font-medium text-[#003087] hover:underline whitespace-nowrap">
                          {r.minister.name}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
