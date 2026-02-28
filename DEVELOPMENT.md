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

## Quick Reference

### Useful Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npx prisma studio` | Browse your database locally |
| `npx prisma migrate dev` | Apply schema changes to the database |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx ts-node scripts/import.ts` | Run the data import script |

### Project Structure

```
/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── ministers/[id]/
│   │   ├── governments/[id]/
│   │   ├── ministries/[id]/
│   │   ├── parties/[id]/
│   │   └── api/search/
│   ├── components/
│   ├── lib/
│   │   └── db.ts
│   └── types/
├── scripts/
│   └── import.ts
└── data/
    └── raw/
```
