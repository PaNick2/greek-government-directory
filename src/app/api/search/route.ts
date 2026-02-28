import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Use raw query for case-insensitive ILIKE search (PostgreSQL)
    const ministers = await db.$queryRaw<
      Array<{
        id: string
        full_name_gr: string
        full_name_en: string | null
        is_currently_serving: boolean
      }>
    >`
      SELECT id, full_name_gr, full_name_en, is_currently_serving
      FROM "Minister"
      WHERE full_name_gr ILIKE ${'%' + q + '%'}
         OR full_name_en ILIKE ${'%' + q + '%'}
      ORDER BY is_currently_serving DESC, full_name_gr ASC
      LIMIT 10
    `

    // Fetch roles/parties for the found ministers
    const ministerIds = ministers.map((m) => m.id)

    const enriched = ministerIds.length > 0
      ? await db.minister.findMany({
          where: { id: { in: ministerIds } },
          select: {
            id: true,
            name: true,
            name_en: true,
            cabinetRoles: {
              orderBy: { start_date: 'desc' },
              take: 1,
              select: {
                role: true,
                end_date: true,
                government: { select: { name: true } },
              },
            },
            partyTerms: {
              orderBy: { from: 'desc' },
              take: 1,
              select: {
                party: { select: { name: true } },
              },
            },
          },
        })
      : []

    const results = enriched.map((m) => ({
      id: m.id,
      name: m.name,
      name_en: m.name_en,
      currentRole: m.cabinetRoles[0]
        ? `${m.cabinetRoles[0].role}${m.cabinetRoles[0].government ? ` — ${m.cabinetRoles[0].government.name}` : ''}`
        : null,
      partyName: m.partyTerms[0]?.party.name ?? null,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[Search API]', err)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}
