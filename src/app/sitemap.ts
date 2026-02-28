import { db } from '@/lib/db'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://eka.gr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ministers, governments, ministries, parties] = await Promise.all([
    db.minister.findMany({ select: { id: true, updatedAt: true } }),
    db.government.findMany({ select: { id: true, updatedAt: true } }),
    db.ministry.findMany({ select: { id: true, updatedAt: true } }),
    db.party.findMany({ select: { id: true, updatedAt: true } }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/ministers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/governments`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/ministries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/parties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const ministerRoutes: MetadataRoute.Sitemap = ministers.map((m) => ({
    url: `${BASE_URL}/ministers/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const governmentRoutes: MetadataRoute.Sitemap = governments.map((g) => ({
    url: `${BASE_URL}/governments/${g.id}`,
    lastModified: g.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const ministryRoutes: MetadataRoute.Sitemap = ministries.map((m) => ({
    url: `${BASE_URL}/ministries/${m.id}`,
    lastModified: m.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const partyRoutes: MetadataRoute.Sitemap = parties.map((p) => ({
    url: `${BASE_URL}/parties/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...ministerRoutes,
    ...governmentRoutes,
    ...ministryRoutes,
    ...partyRoutes,
  ]
}
