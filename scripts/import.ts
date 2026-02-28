/**
 * Import script: reads minister JSON files from data/raw/ and upserts into PostgreSQL via Prisma.
 * Usage: npx tsx scripts/import.ts
 *
 * Safe to re-run — all operations are upserts.
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })
const RAW_DIR = path.join(process.cwd(), 'data', 'raw')

// ─── Helpers ───────────────────────────────────────────────────────────────

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseDate(d: string | null | undefined): Date | null {
  if (!d) return null
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? null : parsed
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function importMinister(filePath: string): Promise<void> {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  console.log(`\n→ Importing: ${data.name ?? filePath}`)

  const ministerId = data.id ?? slug(data.name)

  // 1. Upsert Party
  let partyId: string | null = null
  if (data.party?.current) {
    const partySlug = slug(data.party.current)
    const party = await db.party.upsert({
      where: { slug: partySlug },
      update: { name: data.party.current },
      create: { slug: partySlug, name: data.party.current },
    })
    partyId = party.id
  }

  // 2. Upsert Minister
  await db.minister.upsert({
    where: { slug: ministerId },
    update: {
      name: data.name,
      name_en: data.name_en ?? null,
      born: parseDate(data.born),
      died: parseDate(data.died),
      birthplace: data.birthplace ?? null,
      party_id: partyId,
      bio: data.bio ?? null,
      bio_en: data.bio_en ?? null,
      career_before_politics: data.career_before_politics ?? null,
    },
    create: {
      slug: ministerId,
      name: data.name,
      name_en: data.name_en ?? null,
      born: parseDate(data.born),
      died: parseDate(data.died),
      birthplace: data.birthplace ?? null,
      party_id: partyId,
      bio: data.bio ?? null,
      bio_en: data.bio_en ?? null,
      career_before_politics: data.career_before_politics ?? null,
    },
  })

  const { id: dbId } = await db.minister.findUniqueOrThrow({ where: { slug: ministerId } })

  // 3. Education
  if (Array.isArray(data.education)) {
    await db.education.deleteMany({ where: { minister_id: dbId } })
    for (const e of data.education) {
      await db.education.create({
        data: {
          minister_id: dbId,
          degree: e.degree,
          degree_en: e.degree_en ?? null,
          institution: e.institution,
          year: e.year_graduated ? parseInt(e.year_graduated, 10) : null,
          source: e.source ?? null,
        },
      })
    }
  }

  // 4. Family members
  if (Array.isArray(data.family_and_dynasty?.relatives)) {
    await db.familyMember.deleteMany({ where: { minister_id: dbId } })
    for (const f of data.family_and_dynasty.relatives) {
      await db.familyMember.create({
        data: {
          minister_id: dbId,
          name: f.name,
          relation: f.relation,
          political_role: f.political_role ?? null,
          source: f.source ?? null,
        },
      })
    }
  }

  // 5. Party terms
  if (Array.isArray(data.party?.history)) {
    await db.partyTerm.deleteMany({ where: { minister_id: dbId } })
    for (const pt of data.party.history) {
      const ptPartySlug = slug(pt.party)
      const ptParty = await db.party.upsert({
        where: { slug: ptPartySlug },
        update: { name: pt.party },
        create: { slug: ptPartySlug, name: pt.party },
      })
      await db.partyTerm.create({
        data: {
          minister_id: dbId,
          party_id: ptParty.id,
          from: parseDate(pt.from),
          to: parseDate(pt.to),
          source: pt.source ?? null,
        },
      })
    }
  }

  // 6. Cabinet history
  if (Array.isArray(data.cabinet_history)) {
    await db.cabinetRole.deleteMany({ where: { minister_id: dbId } })
    for (const cr of data.cabinet_history) {
      const govSlug = slug(cr.government)
      const isPM =
        (cr.role_en ?? '').toLowerCase().includes('prime minister') ||
        (cr.role ?? '').includes('Πρωθυπουργός')

      const gov = await db.government.upsert({
        where: { slug: govSlug },
        update: {
          name: cr.government,
          name_en: cr.government_en ?? null,
          end_date: parseDate(cr.end_date),
          ...(isPM ? { prime_minister_id: dbId } : {}),
        },
        create: {
          slug: govSlug,
          name: cr.government,
          name_en: cr.government_en ?? null,
          start_date: parseDate(cr.start_date) ?? new Date('1900-01-01'),
          end_date: parseDate(cr.end_date),
          ...(isPM ? { prime_minister_id: dbId } : {}),
        },
      })

      let ministryId: string | null = null
      if (cr.ministry) {
        const ministrySlug = slug(cr.ministry)
        const ministry = await db.ministry.upsert({
          where: { slug: ministrySlug },
          update: { name: cr.ministry, name_en: cr.ministry_en ?? null },
          create: { slug: ministrySlug, name: cr.ministry, name_en: cr.ministry_en ?? null },
        })
        ministryId = ministry.id
      }

      await db.cabinetRole.create({
        data: {
          minister_id: dbId,
          government_id: gov.id,
          ministry_id: ministryId,
          role: cr.role,
          role_en: cr.role_en ?? null,
          start_date: parseDate(cr.start_date) ?? new Date('1900-01-01'),
          end_date: parseDate(cr.end_date),
          source: cr.source ?? null,
        },
      })
    }
  }

  // 7. Parliamentary activity
  if (data.parliamentary_activity) {
    const pa = data.parliamentary_activity

    if (Array.isArray(pa.terms)) {
      await db.parliamentaryTerm.deleteMany({ where: { minister_id: dbId } })
      // Support both `constituency` and `constituency_current` field names
      const constituency = pa.constituency ?? pa.constituency_current ?? null
      for (const t of pa.terms) {
        await db.parliamentaryTerm.create({
          data: {
            minister_id: dbId,
            constituency,
            from: parseInt(t.from, 10),
            to: t.to ? parseInt(t.to, 10) : null,
            source: t.source ?? null,
          },
        })
      }
    }

    if (Array.isArray(pa.committees)) {
      await db.committeeMembership.deleteMany({ where: { minister_id: dbId } })
      for (const c of pa.committees) {
        await db.committeeMembership.create({
          data: {
            minister_id: dbId,
            name: c.name,
            role: c.role ?? null,
            from: parseDate(c.from),
            to: parseDate(c.to),
            source: c.source ?? null,
          },
        })
      }
    }

    if (Array.isArray(pa.bills_proposed)) {
      await db.billProposed.deleteMany({ where: { minister_id: dbId } })
      for (const b of pa.bills_proposed) {
        await db.billProposed.create({
          data: {
            minister_id: dbId,
            title: b.title,
            date: parseDate(b.date),
            outcome: b.outcome ?? null,
            source: b.source ?? null,
          },
        })
      }
    }
  }

  // 8. Asset declarations
  if (Array.isArray(data.asset_declarations)) {
    await db.assetDeclaration.deleteMany({ where: { minister_id: dbId } })
    for (const a of data.asset_declarations) {
      await db.assetDeclaration.create({
        data: {
          minister_id: dbId,
          year: parseInt(a.year, 10),
          declared_value_eur: a.declared_value_eur ?? null,
          notes: a.notes ?? null,
          source: a.source ?? null,
        },
      })
    }
  }

  // 9. Business interests
  if (Array.isArray(data.business_interests)) {
    await db.businessInterest.deleteMany({ where: { minister_id: dbId } })
    for (const b of data.business_interests) {
      await db.businessInterest.create({
        data: {
          minister_id: dbId,
          company: b.company,
          role: b.role ?? null,
          from: parseDate(b.from),
          to: parseDate(b.to),
          notes: b.notes ?? null,
          source: b.source ?? null,
        },
      })
    }
  }

  // 10. Media ties
  if (Array.isArray(data.media_ties)) {
    await db.mediaTie.deleteMany({ where: { minister_id: dbId } })
    for (const m of data.media_ties) {
      await db.mediaTie.create({
        data: {
          minister_id: dbId,
          media_outlet: m.media_outlet,
          nature: m.nature,
          source: m.source ?? null,
        },
      })
    }
  }

  // 11. Policy positions
  if (Array.isArray(data.policy_positions)) {
    await db.policyPosition.deleteMany({ where: { minister_id: dbId } })
    for (const p of data.policy_positions) {
      await db.policyPosition.create({
        data: {
          minister_id: dbId,
          topic: p.topic,
          position: p.position,
          source: p.source ?? null,
        },
      })
    }
  }

  // 12. Quotes
  if (Array.isArray(data.quotes)) {
    await db.quote.deleteMany({ where: { minister_id: dbId } })
    for (const q of data.quotes) {
      await db.quote.create({
        data: {
          minister_id: dbId,
          text: q.text,
          date: parseDate(q.date),
          context: q.context ?? null,
          source: q.source ?? null,
        },
      })
    }
  }

  // 13. Contradictions
  if (Array.isArray(data.contradictions)) {
    await db.contradiction.deleteMany({ where: { minister_id: dbId } })
    for (const c of data.contradictions) {
      await db.contradiction.create({
        data: {
          minister_id: dbId,
          topic: c.topic,
          past_position: c.past_position,
          past_date: parseDate(c.past_date),
          past_source: c.past_source ?? null,
          current_position: c.current_position,
          current_date: parseDate(c.current_date),
          current_source: c.current_source ?? null,
        },
      })
    }
  }

  // 14. Connections (store as-is; links to other ministers resolved in a second pass)
  if (Array.isArray(data.connections)) {
    ;(global as Record<string, unknown>).__pendingConnections ??= []
    ;(
      (global as Record<string, unknown>).__pendingConnections as {
        from_slug: string
        items: typeof data.connections
      }[]
    ).push({ from_slug: ministerId, items: data.connections })
  }

  // 15. Events
  if (Array.isArray(data.events)) {
    // Delete child records first to avoid FK constraint violations
    const existingEventIds = await db.event
      .findMany({ where: { minister_id: dbId }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id))
    if (existingEventIds.length > 0) {
      await db.eventSource.deleteMany({ where: { event_id: { in: existingEventIds } } })
      await db.constitutionalReference.deleteMany({ where: { event_id: { in: existingEventIds } } })
    }
    await db.event.deleteMany({ where: { minister_id: dbId } })
    for (const e of data.events) {
      const eventSlug = e.id ?? `${ministerId}-${slug(e.title)}-${e.date ?? ''}`
      const event = await db.event.create({
        data: {
          slug: eventSlug,
          minister_id: dbId,
          type: e.type,
          date: parseDate(e.date) ?? new Date(),
          title: e.title,
          title_en: e.title_en ?? null,
          description: e.description,
          description_en: e.description_en ?? null,
          severity: e.severity ?? null,
          resolution: e.resolution ?? null,
          vote_outcome: e.outcome ?? null,
          constitutionality: e.constitutionality ?? null,
          constitutional_notes: e.constitutional_notes ?? null,
          constitutional_court_ruling: e.constitutional_court_ruling ?? null,
          constitutional_ruling_outcome: e.constitutional_ruling_outcome ?? null,
          my_constitutional_assessment: e.my_constitutional_assessment ?? null,
        },
      })

      // Event sources
      if (Array.isArray(e.sources)) {
        for (const s of e.sources) {
          await db.eventSource.create({
            data: { event_id: event.id, label: s.label, url: s.url },
          })
        }
      }

      // Constitutional references
      if (Array.isArray(e.constitutional_references)) {
        for (const ref of e.constitutional_references) {
          await db.constitutionalReference.create({
            data: {
              event_id: event.id,
              article: ref.article,
              constitution_year: ref.constitution_year ?? null,
              description: ref.description ?? null,
              source: ref.source ?? null,
            },
          })
        }
      }
    }
  }

  console.log(`  ✓ Done: ${data.name}`)
}

async function resolveConnections(): Promise<void> {
  // Map Greek or freeform relation_type values to the DB enum
  const RELATION_MAP: Record<string, string> = {
    οικογένεια: 'family',
    family: 'family',
    συγγενική_σχέση: 'family',
    συγγενης: 'family',
    σύζυγος: 'family',
    κομματικός_συνάδελφος: 'party_colleague',
    party_colleague: 'party_colleague',
    επιχειρηματική_σχέση: 'business',
    business: 'business',
    φιλία: 'friendship',
    friendship: 'friendship',
    πολιτική_αντιπαλότητα: 'political_rivalry',
    political_rivalry: 'political_rivalry',
    μέντορας: 'mentor_mentee',
    mentor_mentee: 'mentor_mentee',
  }

  function normaliseRelationType(raw: string): string {
    return RELATION_MAP[raw.toLowerCase()] ?? 'party_colleague'
  }
  const pending = (
    (global as Record<string, unknown>).__pendingConnections as
      | { from_slug: string; items: { person_name: string; relation_type: string; notes?: string; source?: string }[] }[]
      | undefined
  ) ?? []

  if (pending.length === 0) return

  console.log('\n→ Resolving connections...')
  await db.connection.deleteMany({})

  for (const { from_slug, items } of pending) {
    const from = await db.minister.findUnique({ where: { slug: from_slug } })
    if (!from) continue

    for (const conn of items) {
      const toSlug = slug(conn.person_name)
      const to = await db.minister.findUnique({ where: { slug: toSlug } })
      if (!to) {
        console.warn(`  ⚠ Connection target not found: ${conn.person_name} (from ${from_slug})`)
        continue
      }
      await db.connection.create({
        data: {
          from_id: from.id,
          to_id: to.id,
          relation_type: (normaliseRelationType(conn.relation_type ?? '') as never),
          notes: conn.notes ?? null,
          source: conn.source ?? null,
        },
      })
    }
  }
}

async function importParties(): Promise<void> {
  const PARTIES_DIR = path.join(process.cwd(), 'data', 'raw', 'parties')
  if (!fs.existsSync(PARTIES_DIR)) {
    console.log('No data/raw/parties/ directory found, skipping party import.')
    return
  }

  const files = fs.readdirSync(PARTIES_DIR).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.log('No party JSON files found.')
    return
  }

  console.log(`\n── Importing ${files.length} party file(s) ──`)

  for (const file of files) {
    const raw = fs.readFileSync(path.join(PARTIES_DIR, file), 'utf-8')
    const data = JSON.parse(raw)
    const partySlug = data.id ?? slug(data.name)

    console.log(`\n→ Party: ${data.name ?? file}`)

    // Upsert Party core fields
    const party = await db.party.upsert({
      where: { slug: partySlug },
      update: {
        name: data.name,
        name_en: data.name_en ?? null,
        abbreviation: data.abbreviation ?? null,
        abbreviation_en: data.abbreviation_en ?? null,
        color: data.color ?? null,
        founded: parseDate(data.founded),
        dissolved: parseDate(data.dissolved),
        bio: data.bio ?? null,
        bio_en: data.bio_en ?? null,
        ideology: data.ideology ?? null,
        ideology_en: data.ideology_en ?? null,
        political_spectrum: data.political_spectrum ?? null,
        parliamentary_status: data.parliamentary_status ?? null,
      },
      create: {
        slug: partySlug,
        name: data.name,
        name_en: data.name_en ?? null,
        abbreviation: data.abbreviation ?? null,
        abbreviation_en: data.abbreviation_en ?? null,
        color: data.color ?? null,
        founded: parseDate(data.founded),
        dissolved: parseDate(data.dissolved),
        bio: data.bio ?? null,
        bio_en: data.bio_en ?? null,
        ideology: data.ideology ?? null,
        ideology_en: data.ideology_en ?? null,
        political_spectrum: data.political_spectrum ?? null,
        parliamentary_status: data.parliamentary_status ?? null,
      },
    })

    // Upsert ElectionResults
    if (Array.isArray(data.election_results)) {
      for (const er of data.election_results) {
        const electionDate = parseDate(er.election_date)
        if (!electionDate) {
          console.warn(`  ⚠ Skipping election result with invalid date: ${er.election_date}`)
          continue
        }
        await db.electionResult.upsert({
          where: { party_id_election_date: { party_id: party.id, election_date: electionDate } },
          update: {
            vote_percentage: er.vote_percentage ?? null,
            seats: er.seats ?? null,
            total_seats: er.total_seats ?? null,
            formed_government: er.formed_government ?? false,
            notes: er.notes ?? null,
            source: er.source ?? null,
          },
          create: {
            party_id: party.id,
            election_date: electionDate,
            vote_percentage: er.vote_percentage ?? null,
            seats: er.seats ?? null,
            total_seats: er.total_seats ?? null,
            formed_government: er.formed_government ?? false,
            notes: er.notes ?? null,
            source: er.source ?? null,
          },
        })
      }
      console.log(`  ✓ ${data.election_results.length} election result(s)`)
    }

    // Upsert PartyLeaders
    if (Array.isArray(data.leaders)) {
      for (const leader of data.leaders) {
        const fromDate = parseDate(leader.from)
        if (!fromDate) {
          console.warn(`  ⚠ Skipping leader with invalid from date: ${leader.name}`)
          continue
        }
        // Resolve optional minister FK
        let ministerId: string | null = null
        if (leader.minister_id) {
          const m = await db.minister.findUnique({ where: { slug: leader.minister_id }, select: { id: true } })
          ministerId = m?.id ?? null
          if (!m) console.warn(`  ⚠ Leader minister_id not found: ${leader.minister_id}`)
        }
        await db.partyLeader.upsert({
          where: { party_id_name_from: { party_id: party.id, name: leader.name, from: fromDate } },
          update: {
            minister_id: ministerId,
            to: parseDate(leader.to),
            notes: leader.notes ?? null,
            source: leader.source ?? null,
          },
          create: {
            party_id: party.id,
            name: leader.name,
            minister_id: ministerId,
            from: fromDate,
            to: parseDate(leader.to),
            notes: leader.notes ?? null,
            source: leader.source ?? null,
          },
        })
      }
      console.log(`  ✓ ${data.leaders.length} leader(s)`)
    }
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`data/raw directory not found at ${RAW_DIR}`)
    process.exit(1)
  }

  // Collect minister JSON files from data/raw/ministers/ and legacy ministers/ root
  const ministersDirs = [
    path.join(RAW_DIR, 'ministers'),
    path.join(process.cwd(), 'ministers'),
  ]
  const allMinisterFiles: string[] = []
  for (const dir of ministersDirs) {
    if (fs.existsSync(dir)) {
      const found = fs.readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(dir, f))
      allMinisterFiles.push(...found)
    }
  }
  // Also pick up any loose JSON files directly in data/raw/ (backward compat)
  const looseFiles = fs.readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(RAW_DIR, f))
  allMinisterFiles.push(...looseFiles)

  // Deduplicate by filename
  const seen = new Set<string>()
  const files = allMinisterFiles.filter((f) => {
    const base = path.basename(f)
    if (seen.has(base)) return false
    seen.add(base)
    return true
  })

  if (files.length === 0) {
    console.log('No minister JSON files found.')
  } else {
    console.log(`Found ${files.length} minister file(s) to import.\n`)

    const errors: { file: string; error: string }[] = []

    for (const file of files) {
      try {
        await importMinister(file)
      } catch (err) {
        console.error(`  ✗ Failed: ${file}`, err)
        errors.push({ file: path.basename(file), error: String(err) })
      }
    }

    await resolveConnections()

    console.log('\n──────────────────────────────')
    console.log(`Ministers: ${files.length - errors.length} succeeded, ${errors.length} failed.`)
    if (errors.length > 0) {
      errors.forEach(({ file, error }) => console.log(`  - ${file}: ${error}`))
    }
  }

  // Import parties
  await importParties()

  console.log('\n──────────────────────────────')
  console.log('Import complete.')
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
