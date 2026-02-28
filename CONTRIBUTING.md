# Contributing — Data Update Workflow

This document explains how to add or update minister data and get those changes live on the site.

---

## Prerequisites

- Node.js 18+
- Access to the `.env` file with a valid `DATABASE_URL`

---

## Adding or Updating a Minister

### 1. Edit the JSON file

All minister data lives in `data/raw/`. Each minister has one JSON file named after their ID (e.g. `data/raw/nikos-dendias.json`).

To **add** a new minister, create a new JSON file following the same structure as an existing one.

To **update** a minister, edit their existing file directly.

Key fields:

```json
{
  "id": "firstname-lastname",
  "name": "Full Name",
  "nameEl": "Πλήρες Όνομα",
  "bio": "Short biography...",
  "party": { "id": "nd", "name": "Νέα Δημοκρατία" },
  "cabinetRoles": [
    {
      "government": { "id": "mitsotakis-2", "name": "Κυβέρνηση Μητσοτάκη ΙΙ" },
      "ministry": { "id": "foreign-affairs", "name": "Υπουργείο Εξωτερικών" },
      "role": "Υπουργός",
      "startDate": "2023-06-27",
      "endDate": null
    }
  ],
  "events": [],
  "quotes": [],
  "policyPositions": []
}
```

---

### 2. Re-run the import script

```bash
npm run import
```

This upserts all records from `data/raw/*.json` into PostgreSQL. Existing records are updated; new ones are created. It is safe to run repeatedly.

---

### 3. Commit and push

```bash
git add data/raw/
git commit -m "data: update <minister-name>"
git push
```

---

### 4. Vercel revalidation

Pages using ISR (`revalidate = 3600`) will automatically refresh from the database within 1 hour of the next request after the cache expires.

To force an **immediate** refresh of a specific page without waiting, trigger an on-demand revalidation from the Vercel dashboard:

1. Go to your Vercel project → **Deployments**
2. Select the latest deployment → **Functions**
3. Or redeploy with `vercel --prod` to bust all caches instantly

---

## Environment Variables

See `.env.example` for all required variables. For production (Vercel), use the **Transaction pooler** connection string from Supabase (port `6543`) to stay within serverless connection limits.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `NEXT_PUBLIC_BASE_URL` | Production domain, used for sitemap |

---

## Local Development

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL
npm run dev                 # http://localhost:3000
```

Browse the database locally with Prisma Studio:

```bash
npx prisma studio
```
