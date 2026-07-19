# Camp Sambhar Resort

A dynamic, scalable marketing website for **Camp Sambhar** — an eco / rustic-luxury desert camping resort at Sambhar Lake, Rajasthan. Built with **Next.js 16 + Payload CMS 3 + TypeScript + Tailwind v4**.

All content (rooms, experiences, menu, blog, gallery, reviews, about pages) is editable by staff in the admin panel — no code changes needed.

## Quick start

```bash
pnpm install          # install dependencies
pnpm seed             # create admin user + sample content (first run)
pnpm dev              # start dev server
```

- Website: http://localhost:3000
- Admin (CMS): http://localhost:3000/admin
- Default login (change immediately): `admin@campsambhar.com` / `ChangeMe123!`

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm seed` | Populate the database with sample content + admin user |
| `tsx scripts/gen.ts` | Regenerate `payload-types.ts` + admin import map after schema changes |

## Managing content

Everything is in the **admin panel** (`/admin`):

- **Stay** — room categories, photos, prices, amenities, Stayflexi room IDs
- **Experiences** — bird watching, stargazing, salt making, village tour (+ any new ones)
- **Saltbox Café** — menu categories & items, signature dishes, dietary tags
- **Gallery** — albums grouped by theme (shown with a lightbox)
- **Blog** — articles (drafts + publish)
- **Reviews** — curated guest testimonials
- **Team** — people on the About page
- **Pages** — page-builder for About / Sambhar Lake / Eco Tourism / CSR (compose from blocks)
- **Enquiries** — leads captured from the site (built-in CRM)
- **Site Settings** — contact details, socials, map, Stayflexi config, SEO defaults

### Images
`pnpm seed` imports the client's real photography from `/public/photos`. To swap any
image, open the item in `/admin`, upload to its media field, and save — the site
updates automatically (ISR revalidation).

## Raw client assets (not in this repo)

The original client hand-off folders are **deliberately not versioned** — together they
are ~2.1 GB, past GitHub's limits:

| Folder | Size | Contents |
|---|---|---|
| `Camp Sambhar Resort Website Content - Phase 1 - Cogent/` | 1.8 GB | Phase-1 content pack: source photography, brochure PDFs, menu XLSX, policy & about documents |
| `Drone Soot - Videos/` | 247 MB | Raw drone footage (`.mov` / `.mp4`) — not yet used on the site |
| `Camp-Sambhar-Website-Assets/` | 29 MB | Supplied logo, design elements, reference imagery |

Nothing in the build depends on them. Every asset the site actually serves was already
processed into `/public` and seeded into the CMS, and the extracted text lives in
`/content-extracted`. Keep the originals in the team's own storage — they are the master
copies and cannot be recovered from this repo.

The processing scripts that produced `/public` from those folders are in `/scripts`
(`process-new-assets.ts`, `extract-content.ts`, `extract-menu.ts`, `book-assets.ts`);
re-running them requires restoring the raw folders at these paths.

## Configuration

Copy `.env.example` to `.env` and fill in:

- `PAYLOAD_SECRET` — long random string
- `DATABASE_URI` — SQLite (`file:./camp-sambhar.db`) for dev; a `postgres://…` URL for production
- `S3_*` — object storage (Cloudflare R2 / S3) for production media
- `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` — enquiry emails
- `TURNSTILE_*` — Cloudflare Turnstile spam protection
- `NEXT_PUBLIC_STAYFLEXI_PROPERTY_ID` — booking engine (also settable in Site Settings)

## Architecture

- **Next.js App Router** with two route groups: `(frontend)` (the public site) and `(payload)` (the CMS admin + API).
- **Payload CMS** runs inside the same app — one codebase, one deploy. Local API means server components query the DB directly (fast SSG/ISR).
- **Database**: SQLite for zero-setup local dev; switches to Postgres automatically when `DATABASE_URI` starts with `postgres`.
- **Media**: local disk in dev; S3/R2 when configured.
- **SEO**: per-page metadata, dynamic `sitemap.xml`, `robots.txt`, and JSON-LD (LodgingBusiness, Restaurant, BlogPosting, TouristAttraction, Breadcrumb).

See `DESIGN_AND_TECH_STACK.md` for the full design direction and brand guidelines.

## Deployment

Recommended: **Vercel + managed Postgres (Neon) + Cloudflare R2**. Set the env vars above in the host, point `DATABASE_URI` at Postgres, configure `S3_*` for media, and set `NEXT_PUBLIC_SERVER_URL` to the production domain.
