# Greek Government Directory — Agent Context

> This file is intended for LLM coding agents (GitHub Copilot, Claude, etc.) working on this project. Read it before making changes to understand conventions, the data model, and current state.

---

## 1. Project Purpose

**Greek Government Directory (ΕΚΑ — Ελληνικό Κυβερνητικό Αρχείο)** is a public-interest, open-source accountability directory for Greek government ministers, political parties, cabinets, and ministries.

Core goals:
- Chronicle every cabinet role held by every minister, with start/end dates
- Log accountability events (scandals, legal proceedings, votes, statements) with severity and sources
- Track asset declarations, business interests, media ties, policy positions, and quotes
- Expose contradictions between past and current positions
- Provide constitutional analysis independent of court rulings
- Surface connections between political figures

The site is built for transparency, not partisan purposes. All data is source-linked.

---

## 2. Technical Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| ORM | Prisma | ^7.4.2 |
| DB adapter | `@prisma/adapter-pg` | ^7.4.2 |
| Database | PostgreSQL (Supabase) | — |
| Hosting | Vercel (planned) | — |
| Data import | `tsx` (TypeScript executor) | ^4 |

**Important**: Prisma client is generated to `src/generated/prisma` (not the default `node_modules`). Always import from `@/generated/prisma` or use the singleton at `src/lib/db.ts`.

**PgBouncer**: Production uses Supabase Transaction Pooler on port 6543 with `?pgbouncer=true` appended to `DATABASE_URL`. Local development uses the direct connection on port 5432.

---

## 3. Repository

- **GitHub**: `PaNick2/greek-government-directory` (public)
- **Default branch**: `main`
- **Commit history summary**:
  - `4673034` — Milestone 1 (foundation, schema, import script)
  - `9e63a9d` — Milestone 2 (layout, navigation, MinisterCard)
  - `1efb85a` — Milestone 3 (minister profile page)
  - `65d6da8` — Milestone 4 (browse, filter, secondary pages)
  - `49df729` — Milestone 5 (polish, skeletons, ISR, sitemap)
  - `c5f2ddb` — Milestone 6 (GitHub push, CONTRIBUTING.md, .env.example)
  - `0a7e561` — Ad-hoc: `objective_constitutional_assessment` + `objective_constitutionality` fields on Event

---

## 4. Current Prisma Schema

File: `prisma/schema.prisma`

### Enums

```
EventType          : vote | scandal | legal | statement | achievement | appointment | financial | media
Severity           : low | medium | high
Resolution         : resolved | ongoing | pending | dismissed
VoteOutcome        : passed | rejected | abstained
Constitutionality  : constitutional | unconstitutional | disputed | pending_ruling | not_applicable
ConstitutionalRulingOutcome : upheld | struck_down | referred | pending
RelationType       : party_colleague | family | business | friendship | political_rivalry | mentor_mentee
```

### Core Models

#### Party
```
id, slug (unique), name, name_en?, color?
→ ministers[], partyTerms[], createdAt, updatedAt
```
> **Planned (Milestone 7)**: abbreviation, abbreviation_en, founded, dissolved, bio, bio_en, ideology, ideology_en, political_spectrum (enum), parliamentary_status (enum), electionResults[], leaders[]

#### Ministry
```
id, slug (unique), name, name_en?
→ cabinetRoles[]
```

#### Government
```
id, slug (unique), name, name_en?, start_date, end_date?
→ cabinetRoles[]
```

#### Minister
```
id (slug-based), name, name_en?, date_of_birth?, bio?, bio_en?, party_id?
→ party, cabinetRoles[], partyTerms[], events[], assetDeclarations[],
   businessInterests[], mediaTies[], policyPositions[], quotes[],
   contradictions[], connections[], educations[], parliamentaryTerms[],
   billsProposed[]
```

#### CabinetRole (join: Minister ↔ Government ↔ Ministry)
```
minister_id, government_id, ministry_id, role_title, start_date, end_date?
```

#### PartyTerm (join: Minister ↔ Party with dates)
```
minister_id, party_id, from, to?
```

#### Event
```
id, minister_id, type (EventType), title, description?, date?, severity?,
resolution?, vote_outcome?, constitutionality?, constitutional_court_ruling?,
constitutional_ruling_outcome?, objective_constitutional_assessment?,
objective_constitutionality?, constitutional_references?, source?, source2?
```
- `constitutional_court_ruling` — verbatim court ruling text (factual record, may be politically influenced)
- `objective_constitutional_assessment` — independent free-text assessment based on the constitution text
- `objective_constitutionality` — enum verdict derived from the independent assessment

#### AssetDeclaration
```
minister_id, year, declared_value?, currency?, notes?, source?
```

#### BusinessInterest
```
minister_id, company_name, role?, start_date?, end_date?, conflict_of_interest_notes?, source?
```

#### MediaTie
```
minister_id, outlet_name, tie_type?, notes?, source?
```

#### PolicyPosition
```
minister_id, topic, position, date?, source?
```

#### Quote
```
minister_id, text, date?, context?, source?
```

#### Contradiction
```
minister_id, past_position, current_position, topic?, source_past?, source_current?
```

#### Connection
```
minister_id, connected_to_name, relation_type (RelationType)?, notes?
```

#### Education
```
minister_id, institution, degree?, field?, year_start?, year_end?
```

#### ParliamentaryTerm
```
minister_id, constituency?, from, to?, party?
```

#### Committee
```
minister_id, name, role?, from?, to?
```

#### BillProposed
```
minister_id, title, date?, outcome?, source?
```

---

## 5. Data Flow

```
data/raw/ministers/*.json   (or ministers/*.json)
       ↓
scripts/import.ts           (npx tsx scripts/import.ts  |  npm run import)
       ↓ upserts all records via Prisma
PostgreSQL (Supabase)
       ↓ queried at build time or revalidation
Next.js pages (ISR, revalidate = 3600)
```

### Import Script Conventions
- Safe to re-run (all operations are `upsert`)
- Minister `id` = slugified name (e.g. `kyriakos-mitsotakis`)
- Party `id` = slugified current party name from the minister JSON
- Slug helper: lowercase → remove diacritics → replace non-alphanumeric with `-`
- `parseDate()` returns `null` for missing/invalid dates (never throws)

### JSON File Conventions
- One file per minister under `ministers/` (legacy) or `data/raw/ministers/`
- One file per party under `data/raw/parties/` (Milestone 7, not yet created)
- Null fields must be explicitly set to `null` (not omitted) for clarity

---

## 6. Key File Locations

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema (source of truth) |
| `prisma/migrations/` | Applied migration SQL files |
| `src/lib/db.ts` | Prisma client singleton |
| `src/generated/prisma/` | Auto-generated Prisma client (do not edit) |
| `scripts/import.ts` | Data import/upsert script |
| `src/app/ministers/[id]/page.tsx` | Minister profile page |
| `src/app/parties/[id]/page.tsx` | Party detail page |
| `src/app/parties/page.tsx` | Party listing page |
| `src/components/MinisterCard.tsx` | Reusable minister card |
| `src/components/Skeleton.tsx` | Loading skeleton component |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `.env.example` | Environment variable template |
| `CONTRIBUTING.md` | Data update workflow for contributors |

---

## 7. Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. For production: Transaction Pooler port 6543 with `?pgbouncer=true`. For local dev: direct port 5432. |
| `NEXT_PUBLIC_BASE_URL` | Full URL of the deployed site (e.g. `https://yourdomain.vercel.app`). Used in the sitemap. |

---

## 8. Coding Conventions

### Next.js / App Router
- All data-fetching pages are **server components** (no `'use client'`)
- `export const revalidate = 3600` on every page (ISR, 1-hour cache)
- `generateStaticParams()` on all `[id]` routes for static generation
- `generateMetadata()` on all pages for SEO
- `notFound()` from `next/navigation` for missing records

### Prisma Queries
- Always use `select` or targeted `include` — never fetch all fields/relations blindly
- Use `distinct` when querying through join tables to avoid duplicates
- Relation IDs (e.g. `party_id`, `ministry_id`) are stored as strings (cuid or slug)

### TypeScript
- Infer types from Prisma output where possible; avoid redundant interfaces
- `params` in Next.js 15+ is `Promise<{id: string}>`, always `await params`

### Styling (Tailwind CSS 4)
- No custom CSS files — Tailwind utilities only
- Consistent colour palette:
  - Brand blue: `#003087`
  - Severity high: `red-*`
  - Severity medium: `amber-*`
  - Severity low: `emerald-*`
  - Court ruling block: `slate-*` border
  - Constitutional assessment block: `violet-*` border
  - Spectrum badges: custom colours per spectrum value (see party pages)

---

## 9. Current Implementation Status

| Feature | Status |
|---|---|
| Database schema (core) | ✅ Complete |
| Import script | ✅ Complete (ministers) |
| Homepage | ✅ |
| Ministers browse + profile | ✅ |
| Governments browse + detail | ✅ |
| Ministries browse + detail | ✅ |
| Parties listing + detail | ✅ (minimal — name, color, member count) |
| Loading skeletons | ✅ |
| 404 pages | ✅ |
| Sitemap | ✅ |
| ISR on all pages | ✅ (revalidate = 3600) |
| GitHub push | ✅ `PaNick2/greek-government-directory` |
| Vercel deployment | ⏳ Pending manual setup |
| `objective_constitutional_assessment` + `objective_constitutionality` | ✅ Schema + migration + UI |
| Party enrichment (Milestone 7) | ❌ Not started |

---

## 10. Pending Work (Milestone 7 — Party Enrichment)

### Schema changes needed
1. Add `PoliticalSpectrum` enum
2. Add `ParliamentaryStatus` enum
3. Expand `Party` model with: `abbreviation`, `abbreviation_en`, `founded`, `dissolved`, `bio`, `bio_en`, `ideology`, `ideology_en`, `political_spectrum`, `parliamentary_status`
4. Add `ElectionResult` model (FK to Party)
5. Add `PartyLeader` model (FK to Party + optional FK to Minister)
6. Add `partyLeaderships PartyLeader[]` back-relation to `Minister`

### Migration
```bash
npx prisma migrate dev --name party-enrichment
```

### Data
- Create `data/raw/parties/` directory
- Create one JSON file per party (see sample structure in `DEVELOPMENT.md` Milestone 7 Step 6)

### Import script additions
- Add `importParties()` function to `scripts/import.ts`
- Process `data/raw/parties/*.json`
- Upsert Party fields, ElectionResult rows, PartyLeader rows

### UI changes
- `src/app/parties/page.tsx`: add abbreviation, spectrum badge, status badge, founded year
- `src/app/parties/[id]/page.tsx`: add bio, ideology, leadership timeline, election results table

---

## 11. Running Locally

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env
# Edit .env and set DATABASE_URL (direct connection, port 5432)

# Apply any pending migrations
npm run db:migrate

# Import data
npm run import

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
