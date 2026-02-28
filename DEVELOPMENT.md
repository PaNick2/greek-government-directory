# Greek Government Directory — Development Steps

## Milestone 1 — Project Foundation

### Step 1: Initialize the Next.js 14 Project

Run this in your terminal in the folder where you want the project to live:

```bash
npx create-next-app@latest greek-government-directory --typescript
```

When prompted, answer:
- **Would you like to use ESLint?** → Yes
- **Would you like to use Tailwind CSS?** → Yes
- **Would you like to use the `src/` directory?** → Yes
- **Would you like to use App Router?** → Yes
- **Would you like to customize the default import alias?** → No

Then move into the project folder:

```bash
cd greek-government-directory
```

Open it in VS Code:

```bash
code .
```

---

### Step 2: Install Prisma & Connect to Supabase

Install Prisma:

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

Create a Supabase project at [supabase.com](https://supabase.com), then copy your connection string from:
`Project Settings → Database → Connection String → URI`

Add it to your `.env` file:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
```

---

### Step 3: Write the Prisma Schema

Write the full schema in `prisma/schema.prisma` covering all tables:
- `Minister`, `Government`, `Ministry`, `Party`
- `CabinetRole` (minister ↔ government ↔ ministry join table, with dates)
- `Event` (typed: vote, scandal, legal, etc.)
- `AssetDeclaration`
- `BusinessInterest`
- `MediaTie`
- `PolicyPosition`
- `Quote`
- `Contradiction`
- `Connection`
- `Education`
- `ParliamentaryTerm`, `Committee`, `BillProposed`

---

### Step 4: Run the Migration

```bash
npx prisma migrate dev --name init
```

This creates all tables in your Supabase database.

---

### Step 5: Create the Prisma Client Singleton

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

### Step 6: Write the JSON Import Script

Create `scripts/import.ts` — reads all files from `/data/raw/*.json`, validates them, and upserts all records into PostgreSQL via Prisma.

Run it with:

```bash
npx ts-node scripts/import.ts
```

---

### Step 7: Verify Data in Supabase Studio

- Open your Supabase project dashboard
- Go to **Table Editor**
- Browse every table and confirm all records imported correctly
- Run a few manual queries in the **SQL Editor** to check relations

**Milestone 1 is done when:** All data is in PostgreSQL, the app boots, and Prisma can query it.

---

## Milestone 2 — Core Layout & Navigation

### Step 1: Build the Global Layout

Create `src/components/Layout.tsx` — header, footer, navigation bar.

### Step 2: Build the Homepage

Build `src/app/page.tsx`:
- Intro text
- Search bar
- Quick stats (total ministers, governments covered)
- Links to browse sections

### Step 3: Set Up Routing Structure

Create the following route folders under `src/app/`:

```
src/app/
├── ministers/
│   ├── page.tsx           ← browse all ministers
│   └── [id]/
│       └── page.tsx       ← individual profile
├── governments/
│   ├── page.tsx           ← list all cabinets
│   └── [id]/
│       └── page.tsx       ← cabinet detail
├── ministries/
│   ├── page.tsx           ← list all ministries
│   └── [id]/
│       └── page.tsx       ← ministry detail
└── parties/
    └── [id]/
        └── page.tsx       ← party detail
```

### Step 4: Build the MinisterCard Component

Create `src/components/MinisterCard.tsx`:
- Name
- Party
- Current role badge
- "Currently Serving" vs "Past" indicator

### Step 5: Build the Search Bar

Create `src/components/SearchBar.tsx`:
- Queries PostgreSQL via an API route (`src/app/api/search/route.ts`)
- Uses `pg_trgm` for Greek full-text fuzzy search

**Milestone 2 is done when:** You can navigate between all main sections and see lists of data.

---

## Milestone 3 — Minister Profile Page

Build `src/app/ministers/[id]/page.tsx` with all sections:

### Step 1: Profile Header
- Name, party, current role, current ministry

### Step 2: Biography Section
- Bio text, education list, pre-political career

### Step 3: Family & Dynasty Section
- Political relatives list

### Step 4: Career Timeline
- Visual chronological view of all cabinet roles and key events
- Use `react-chrono` or custom CSS timeline

```bash
npm install react-chrono
```

### Step 5: Cabinet History Table
- All governments, roles, ministries, with start and end dates

### Step 6: Parliamentary Activity Section
- Terms served, committees, bills proposed, attendance rate

### Step 7: Events / Accountability Log
- Filterable list by event type
- Severity badges (`low` / `medium` / `high`) for scandal and legal events
- Resolution status indicators
- Source link on every item

### Step 8: Contradictions Section
- Past position vs. current position side-by-side

### Step 9: Asset Declarations Section
- Year-by-year table with declared value and notes

### Step 10: Business Interests & Media Ties Section
- Company, role, dates, conflict of interest notes

### Step 11: Policy Positions Section
- Topic + stated position + source link

### Step 12: Quotes Section
- Quote text, date, context, source link

### Step 13: Connections Section
- Connected person, relation type, notes

### Step 14: Static Generation & SEO

Add to the profile page:

```typescript
export async function generateStaticParams() {
  const ministers = await db.minister.findMany({ select: { id: true } })
  return ministers.map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const minister = await db.minister.findUnique({ where: { id: params.id } })
  return {
    title: minister?.name,
    description: minister?.bio?.slice(0, 160),
  }
}
```

**Milestone 3 is done when:** A complete, richly detailed profile page exists for every minister.

---

## Milestone 4 — Browse, Filter & Secondary Pages

### Step 1: Ministers Browse Page (`/ministers`)
- Filter by party, ministry, government, active/past status
- Sort by name, number of events, years in office

### Step 2: Government/Cabinet Page (`/governments/[id]`)
- Full member list with roles and dates
- Prime minister highlighted
- Date range of the government

### Step 3: Ministry Page (`/ministries/[id]`)
- All ministers who have ever held this role
- Reverse chronological order
- Duration each person held the role

### Step 4: Party Page (`/parties/[id]`)
- All ministers from this party across all governments
- Total time the party has been in government

### Step 5: Global Search
- Search across minister names, event titles, quotes, policy positions
- PostgreSQL full-text search with Greek support via `pg_trgm`

**Milestone 4 is done when:** All secondary pages are live and filtering/search works.

---

## Milestone 5 — Polish & Performance

### Steps
1. Add **pagination** or infinite scroll on browse pages
2. Add **loading skeletons** for all data-fetching pages
3. Implement proper **404 pages** for unknown slugs
4. Audit and optimize Prisma queries — use `select` to avoid over-fetching
5. Add **database indexes** on frequently filtered columns (`party_id`, `ministry_id`, `event_type`, `date`)
6. Ensure all pages use **Static Generation or ISR** (Incremental Static Regeneration)
7. Generate a **sitemap** at `/sitemap.xml` from all minister and government slugs
8. Accessibility pass — semantic HTML, keyboard navigation, contrast ratios

**Milestone 5 is done when:** The site is fast, accessible, and SEO-ready.

---

## Milestone 6 — Deployment & Maintenance

### Steps
1. Push project to a GitHub repository
2. Connect the GitHub repo to a new **Vercel** project
3. Add production environment variables in Vercel dashboard (`DATABASE_URL`, etc.)
4. Enable **Supabase connection pooling** via PgBouncer for serverless compatibility
5. Deploy and smoke-test all pages in production
6. Document the data update workflow in `CONTRIBUTING.md`:
   - Edit the minister's JSON file
   - Re-run the import script
   - Vercel revalidates the affected pages automatically

**Milestone 6 is done when:** The site is live on Vercel and you have a repeatable process for updating data.

---

## Ad-hoc Change — Constitutional Assessment Field

> Completed after Milestone 6 (commit `0a7e561`).

The `constitutional_court_ruling` field on `Event` records an official court decision — but court rulings can be politically influenced and are not always a reliable indicator of constitutionality. This change adds a separate, independent field for our own assessment.

### Steps Taken

1. **Schema** — Added `my_constitutional_assessment String? @db.Text` to the `Event` model in `prisma/schema.prisma`
2. **Migration** — Ran `npx prisma migrate dev --name add_my_constitutional_assessment`
3. **Import script** — Added `my_constitutional_assessment: e.my_constitutional_assessment ?? null` in the event upsert block in `scripts/import.ts`
4. **JSON data** — Added `"my_constitutional_assessment": null` to all events in `ministers/kyriakos-mitsotakis-complete.json`
5. **Minister profile page** — Updated `src/app/ministers/[id]/page.tsx`:
   - Court ruling displays in a **slate** bordered block (🏛️ Απόφαση δικαστηρίου)
   - Independent assessment displays in a **violet** bordered block (📋 Ανεξάρτητη συνταγματική εκτίμηση) when non-null

### Data Entry Workflow

To fill in an assessment for an event:
1. Open the minister's JSON file (e.g. `ministers/kyriakos-mitsotakis-complete.json`)
2. Set `"my_constitutional_assessment"` to a non-null string on the relevant event
3. Run `npm run import`
4. The violet block will now render on the profile page

---

## Milestone 7 — Party Enrichment

Parties currently store only `name`, `name_en`, `color`, and `slug`. This milestone adds biographical, historical, electoral, and leadership data for each party.

### Step 1: Add New Enums to the Schema

Add to `prisma/schema.prisma`:

```prisma
enum PoliticalSpectrum {
  far_left
  left
  centre_left
  centre
  centre_right
  right
  far_right
}

enum ParliamentaryStatus {
  governing
  opposition
  junior_coalition_partner
  extra_parliamentary
  dissolved
}
```

### Step 2: Expand the Party Model

Replace the current `Party` model with:

```prisma
model Party {
  id                   String               @id @default(cuid())
  slug                 String               @unique
  name                 String
  name_en              String?
  abbreviation         String?
  abbreviation_en      String?
  color                String?
  founded              DateTime?            @db.Date
  dissolved            DateTime?            @db.Date
  bio                  String?              @db.Text
  bio_en               String?              @db.Text
  ideology             String?
  ideology_en          String?
  political_spectrum   PoliticalSpectrum?
  parliamentary_status ParliamentaryStatus?
  ministers            Minister[]
  partyTerms           PartyTerm[]
  electionResults      ElectionResult[]
  leaders              PartyLeader[]
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt
}
```

### Step 3: Add the ElectionResult Model

```prisma
model ElectionResult {
  id               String   @id @default(cuid())
  party_id         String
  party            Party    @relation(fields: [party_id], references: [id], onDelete: Cascade)
  election_date    DateTime @db.Date
  vote_percentage  Float?
  seats            Int?
  total_seats      Int?
  formed_government Boolean @default(false)
  notes            String?  @db.Text
  source           String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Step 4: Add the PartyLeader Model

```prisma
model PartyLeader {
  id          String    @id @default(cuid())
  party_id    String
  party       Party     @relation(fields: [party_id], references: [id], onDelete: Cascade)
  name        String
  minister_id String?
  minister    Minister? @relation(fields: [minister_id], references: [id], onDelete: SetNull)
  from        DateTime  @db.Date
  to          DateTime? @db.Date
  notes       String?   @db.Text
  source      String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

Also add `partyLeaderships PartyLeader[]` to the `Minister` model.

### Step 5: Run the Migration

```bash
npx prisma migrate dev --name party-enrichment
```

### Step 6: Create Party JSON Files

Create one JSON file per party under `data/raw/parties/`. Example — `data/raw/parties/nd.json`:

```json
{
  "id": "nd",
  "name": "Νέα Δημοκρατία",
  "name_en": "New Democracy",
  "abbreviation": "ΝΔ",
  "abbreviation_en": "ND",
  "color": "#0066CC",
  "founded": "1974-10-04",
  "dissolved": null,
  "political_spectrum": "centre_right",
  "parliamentary_status": "governing",
  "ideology": "Κεντροδεξιά, Φιλελευθερισμός, Συντηρητισμός",
  "ideology_en": "Centre-right, Liberalism, Conservatism",
  "bio": "Η Νέα Δημοκρατία ιδρύθηκε το 1974 από τον Κωνσταντίνο Καραμανλή...",
  "bio_en": "New Democracy was founded in 1974 by Konstantinos Karamanlis...",
  "election_results": [
    {
      "election_date": "2023-06-25",
      "vote_percentage": 40.56,
      "seats": 158,
      "total_seats": 300,
      "formed_government": true,
      "notes": "Αυτοδυναμία με ενισχυμένη αναλογική",
      "source": "https://ekloges.ypes.gr"
    }
  ],
  "leaders": [
    {
      "name": "Κυριάκος Μητσοτάκης",
      "minister_id": "kyriakos-mitsotakis",
      "from": "2016-01-11",
      "to": null,
      "source": "https://nd.gr"
    }
  ]
}
```

### Step 7: Add `importParties()` to the Import Script

Add a new function in `scripts/import.ts` that:
1. Reads all `*.json` files from `data/raw/parties/`
2. Upserts each `Party` with all new fields
3. Upserts each `ElectionResult` (keyed on `party_id + election_date`)
4. Upserts each `PartyLeader` (keyed on `party_id + name + from`)

Call it from the `main()` function after `importMinister()` calls.

### Step 8: Update `/parties` listing page

Update `src/app/parties/page.tsx` to display on each card:
- Abbreviation next to the name
- Political spectrum badge (colour-coded)
- Parliamentary status badge (governing / opposition / etc.)
- Founded year
- Member count (already present)

### Step 9: Update `/parties/[id]` detail page

Update `src/app/parties/[id]/page.tsx` to display:
- **Bio section** — full biography text in Greek (with English toggle if `bio_en` present)
- **Ideology & spectrum** — ideology string + spectrum badge
- **Parliamentary status** badge in the hero
- **Leadership timeline** — ordered list of leaders with dates and optional minister profile link
- **Election results table** — date, vote %, seats / total seats, formed-government indicator, source link
- Keep the existing **Members grid** section

**Milestone 7 is done when:** All party pages show rich historical, electoral, and leadership data driven by JSON files.

---

## Quick Reference

### Useful Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npm run import` | Run the data import script (`npx tsx scripts/import.ts`) |
| `npm run build` | Production build (confirms no type / compile errors) |
| `npm run db:migrate` | Apply pending schema migrations (`npx prisma migrate dev`) |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run db:studio` | Browse the database locally in Prisma Studio |

### Project Structure

```
/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── data/
│   └── raw/
│       ├── ministers/            ← one JSON file per minister
│       └── parties/              ← one JSON file per party (Milestone 7+)
├── ministers/                    ← legacy location for minister JSON files
├── src/
│   ├── app/
│   │   ├── page.tsx              ← homepage
│   │   ├── sitemap.ts
│   │   ├── not-found.tsx
│   │   ├── ministers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── governments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── ministries/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── parties/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── api/search/route.ts
│   ├── components/
│   │   ├── MinisterCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── Skeleton.tsx
│   ├── lib/
│   │   └── db.ts                 ← Prisma client singleton
│   └── generated/
│       └── prisma/               ← auto-generated Prisma client output
├── scripts/
│   └── import.ts                 ← data import/upsert script
├── .env                          ← local env vars (git-ignored)
├── .env.example                  ← env var template (committed)
├── CONTRIBUTING.md
├── DEVELOPMENT.md
└── AGENT_CONTEXT.md              ← agent/LLM context file
```
