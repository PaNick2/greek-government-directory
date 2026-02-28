import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const found = await db.minister.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { name_en: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 10,
      select: {
        id: true,
        slug: true,
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

    const results = found.map((m) => ({
      slug: m.slug,
      name: m.name,
      name_en: m.name_en,
      isActive: m.cabinetRoles.some((r) => !r.end_date),
      currentRole: m.cabinetRoles[0]
        ? `${m.cabinetRoles[0].role}${
            m.cabinetRoles[0].government ? ` — ${m.cabinetRoles[0].government.name}` : ''
          }`
        : null,
      partyName: m.partyTerms[0]?.party.name ?? null,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[Search API]', err)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}
