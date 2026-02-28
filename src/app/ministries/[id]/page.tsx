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
  const ministry = await db.ministry.findUnique({ where: { id }, select: { name: true } })
  return { title: ministry ? `${ministry.name} | ΕΚΑ` : 'Υπουργείο | ΕΚΑ' }
}

export default async function MinistryDetailPage({ params }: PageProps) {
  const { id } = await params

  const ministry = await db.ministry.findUnique({
    where: { id },
    include: {
      cabinetRoles: {
        orderBy: { start_date: 'asc' },
        include: {
          minister: { select: { id: true, slug: true, name: true } },
          government: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!ministry) notFound()

  // Group roles by government
  const byGov = new Map<string, {
    govId: string
    govName: string
    roles: typeof ministry.cabinetRoles
  }>()

  for (const role of ministry.cabinetRoles) {
    if (!role.government) continue
    const key = role.government.id
    if (!byGov.has(key)) {
      byGov.set(key, { govId: role.government.id, govName: role.government.name, roles: [] })
    }
    byGov.get(key)!.roles.push(role)
  }

  // Sort governments chronologically (earliest start_date first)
  const govGroups = Array.from(byGov.values()).sort((a, b) => {
    const aDate = a.roles[0]?.start_date?.getTime() ?? 0
    const bDate = b.roles[0]?.start_date?.getTime() ?? 0
    return aDate - bDate
  })

  const uniqueMinisters = new Set(ministry.cabinetRoles.map((r) => r.minister_id)).size

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/ministries" className="hover:text-[#003087]">Υπουργεία</Link>
        {' / '}
        <span className="text-slate-800">{ministry.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{ministry.name}</h1>
        {ministry.name_en && <p className="mt-0.5 text-slate-400">{ministry.name_en}</p>}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>{ministry.cabinetRoles.length} θητεί{ministry.cabinetRoles.length === 1 ? 'α' : 'ες'}</span>
          <span>{uniqueMinisters} διαφορετικοί υπουργοί</span>
          <span>{govGroups.length} κυβερνήσεις</span>
        </div>
      </div>

      {/* Timeline grouped by government */}
      {govGroups.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-500 text-sm">Δεν υπάρχουν καταχωρημένες θητείες.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {govGroups.map(({ govId, govName, roles }) => (
            <section key={govId}>
              <div className="mb-3 flex items-center gap-2">
                <Link
                  href={`/governments/${govId}`}
                  className="text-sm font-semibold text-[#003087] hover:underline"
                >
                  {govName}
                </Link>
                <span className="text-xs text-slate-400">({roles.length} θέση/θέσεις)</span>
              </div>
              <div className="space-y-2">
                {roles.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div>
                      {r.minister ? (
                        <Link
                          href={`/ministers/${r.minister.slug}`}
                          className="text-sm font-medium text-slate-900 hover:text-[#003087] transition"
                        >
                          {r.minister.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">{r.role}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400 whitespace-nowrap ml-4">
                      {r.start_date
                        ? new Date(r.start_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                        : '—'}
                      {' → '}
                      {r.end_date
                        ? new Date(r.end_date).toLocaleDateString('el-GR', { month: 'short', year: 'numeric' })
                        : 'Σήμερα'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
