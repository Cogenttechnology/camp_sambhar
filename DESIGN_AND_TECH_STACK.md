# Camp Sambhar Resort — Design Direction & Tech Stack

> A fully **dynamic, scalable** web platform for an eco / rustic-luxury desert camping resort at **Sambhar Lake, Rajasthan** — not a static brochure. Built to showcase the resort today and grow into a full digital ecosystem (bookings, guest accounts, e-commerce, events) tomorrow.

---

## 1. The Big Idea

Sambhar Lake is India's largest inland salt lake — famous for **winter flamingos** (Nov–Feb), **dark-sky stargazing / astrotourism**, **salt-making heritage**, and **village culture**. The website should feel like **entering a nature escape**, not booking a hotel.

Three signature themes run through everything:

- 🌌 **Astronomy** — dark skies, stargazing, night-sky sections
- 🦩 **Wildlife** — flamingos, migratory birds, birding
- 🧂 **Salt Lake** — white salt pans, heritage, rustic texture

---

## 2. Design Direction

### Feel
Nature-first · Peaceful · Rustic luxury · Eco-friendly · Minimal but immersive.
**Explicitly NOT a typical hotel website** — no dense amenity grids, glossy CTAs, or generic carousels.

### Palette (STRICT — brand-mandated, use ONLY these across the full site)
| Token | Hex | Use |
|---|---|---|
| Salt Ivory | `#F3EBDD` | Primary warm background |
| Camp Red | `#A92B2E` | Primary brand / CTAs |
| Deep Terracotta | `#7D211D` | Hover / depth on red |
| Desert Sand | `#CBB18B` | Warm neutral, borders |
| Sage | `#7A7B60` | Eco accent |
| Night Indigo | `#17253A` | Astronomy, footer, dark hero |
| Charcoal | `#2A2723` | Primary text |
| White | `#FFFFFF` | Cards, contrast surfaces |

### Typography (STRICT)
- **Cormorant Garamond** — editorial headings
- **Manrope** — navigation, body, buttons
- **Montserrat ExtraBold** — logo wordmark **only**
- Self-hosted via `next/font`, `display: swap`

### Layout language
Generous whitespace · full-bleed nature imagery · asymmetric editorial sections · subtle scroll reveals (`framer-motion`, respects `prefers-reduced-motion`) · a dark "night sky" section for stargazing · minimal chrome.

### Trust elements (trust = bookings)
Curated real Google reviews · real guest photos · media mentions (if any) · safety standards · family-friendly badges — surfaced on Home & Stay.

---

## 3. Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 | RSC + ISR = static speed with dynamic CMS content; best-in-class SEO & images |
| **Language** | TypeScript | Payload auto-generates types → content shape enforced end-to-end |
| **Styling** | Tailwind CSS v4 + restyled shadcn/ui primitives | Fast bespoke, non-hotel look; accessible components |
| **CMS + Backend** | **Payload CMS 3** (embedded in Next.js) | One codebase for site + admin + API; real DB for leads/CRM & future bookings/accounts |
| **Database** | PostgreSQL | Relational, scales into the ecosystem |
| **Media** | Object storage (Cloudflare R2 / S3) via Payload plugin | Image-heavy site; CDN delivery, lean DB |
| **Images** | next/image + sharp | AVIF/WebP, responsive sizes, blur placeholders |
| **Forms** | react-hook-form + zod | Shared client/server validation |
| **Email** | Resend (or SMTP) | Lead email + guest auto-reply |
| **WhatsApp** | wa.me click-to-chat (prefilled) | Simple, no API cost |
| **Spam** | Cloudflare Turnstile + honeypot + rate limit | Free, privacy-friendly |
| **Animation** | framer-motion (subtle) | Immersive without hurting speed |
| **Maps** | Google Maps facade (loads on click) | Protects page-load performance |

### Why Payload CMS
Payload is a **backend framework + CMS in one**, running inside the same Next.js app (admin at `/admin`, API at `/api`):
- **One codebase, one deploy** — no separate CMS to sync
- **Real database** → enquiry leads are first-class records (built-in lightweight CRM); future bookings, guest accounts, orders extend the same schema
- **Local API** → server components query directly (no network hop) → fast pages
- **Auto types + REST/GraphQL** → ready for a future mobile app or integrations

Trade-off: needs Node + Postgres + object storage (more infra than a hosted CMS) — but that's exactly what the future ecosystem requires.

---

## 4. Sitemap

1. **Home** — hero · rooms preview · experiences · reviews · map · blog teasers · enquiry popup
2. **About Us** — About Us · About Sambhar Lake · Sustainable/Eco Tourism · CSR · Our Team
3. **Saltbox Café & Restaurant** — concept · menu · signature dishes · timings · private/bonfire dining
4. **Stay / Accommodation** — room categories · galleries · **embedded Stayflexi booking widget**
5. **Experiences** — Bird Watching · Sambhar Village Tour · Salt Making Process Visit · Professional Stargazing (each: detail + gallery)
6. **Gallery** — albums + lightbox
7. **Blog** — SEO long-tail articles
8. **Contact Us** — enquiry form · map · details

---

## 5. Content Model (editable by staff, no code)

`Rooms` · `Experiences` · `BlogPosts` · `GalleryAlbums` · `MenuCategories` + `MenuItems` · `Reviews` (curated) · `Team` · `Pages` (page-builder for About cluster) · `Enquiries` (lead inbox / CRM) · `Media` · `SiteSettings` (global: contact, socials, map, Stayflexi config, default SEO).

Every content type has an `seo` group (meta title/description, OG image) and enforced image alt text.

---

## 6. Integrations

- **Stayflexi booking engine** — embeddable widget via `next/script`, IDs from CMS, opens in a modal (no redirect), error-boundary fallback to enquiry CTA.
- **Enquiry pipeline** — `POST /api/enquiry`: validate → anti-spam → **fan-out**: save CMS record **+** email resort (+ guest auto-reply) **+** return `wa.me` click-to-chat link.
- **Reviews** — manually curated in the CMS; drives an `AggregateRating` for SEO.
- **Maps** — Google Maps facade, config from SiteSettings.

---

## 7. SEO (high priority)

- Per-page metadata from the CMS (`generateMetadata`), canonicals, OpenGraph/Twitter cards
- JSON-LD: `LodgingBusiness`, `Restaurant`, `BlogPosting`, `TouristAttraction`, `BreadcrumbList`
- Dynamic `sitemap.ts` + `robots.ts` from CMS content
- Keyword targeting per page (stargazing / flamingos / salt making / best time to visit Sambhar Lake)
- Local SEO: consistent NAP, embedded map, `sameAs` to Google Business Profile
- Performance = SEO: ISR + optimized images → strong Core Web Vitals

---

## 8. Hosting

Payload needs **Node + Postgres + object storage**. **Default plan: Vercel + Neon Postgres + Cloudflare R2** (revisited before launch). Alternatives: Railway / Render / Fly.io, or an India-region VPS if data residency is required.

---

## 9. Build Phases

| Phase | Focus |
|---|---|
| **0 — Foundations** | Scaffold Next.js + Payload + Postgres; design tokens; media storage; deploy skeleton |
| **1 — Model + Layout** | All collections + SiteSettings + page-builder; nav/footer; SEO helpers; seed content |
| **2 — Conversion pages** | Stay + Stayflexi widget · Experiences · Café menu |
| **3 — Home + Enquiry** | Home composition · enquiry popup · lead pipeline · reviews |
| **4 — Content pages** | About cluster · Gallery · Blog · Contact |
| **5 — SEO + Launch** | Sitemap/robots/JSON-LD · performance/a11y pass · analytics · Search Console · staff training |
| **Future** | Guest portal · events/retreats · Hindi i18n · newsletter · e-commerce (salt/craft) |

---

*Sources for location research: [Incredible India — Sambhar Lake](https://www.incredibleindia.gov.in/en/rajasthan/jaipur/sambhar-lake), [Starscapes — Sambhar Lake Tourism](https://www.starscapes.zone/sambhar-lake-tourism/).*
