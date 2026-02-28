import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MinisterCard from '@/components/MinisterCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const party = await db.party.findUnique({ where: { id }, select: { name: true } })
  return { title: party ? `${party.name} | ΕΚΑ` : 'Κόμμα | ΕΚΑ' }
}

export default async function PartyDetailPage({ params }: PageProps) {
  const { id } = await params

  const party = await db.party.findUnique({
    where: { id },
    include: {
      partyTerms: {
        orderBy: { from: 'asc' },
        distinct: ['minister_id'],
        include: {
          minister: {
            select: {
              id: true,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/parties" className="hover:text-[#003087]">
          Κόμματα
        </Link>{' '}
        / <span className="text-slate-800">{party.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 flex items-start gap-4">
        {party.color && (
          <div
            className="h-16 w-3 flex-shrink-0 rounded-full mt-1"
            style={{ backgroundColor: party.color }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{party.name}</h1>
          {party.name_en && <p className="text-slate-400 mt-0.5">{party.name_en}</p>}
        </div>
      </div>

      {/* Members */}
      {party.partyTerms.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Μέλη ({party.partyTerms.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {party.partyTerms.map((pt) => {
              const m = pt.minister
              const lastRole = m.cabinetRoles[0]
              const isActive = m.cabinetRoles.some((r) => !r.end_date)
              return (
                <MinisterCard
                  key={m.id}
                  id={m.id}
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
      )}

      {party.partyTerms.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-500 text-sm">Δεν υπάρχουν καταχωρημένα μέλη ακόμη.</p>
        </div>
      )}
    </div>
  )
}


