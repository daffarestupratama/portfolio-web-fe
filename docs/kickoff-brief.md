# Claude Code Kickoff Brief — Daffa's Portfolio Frontend

You are building the frontend for a personal portfolio + freelance tour-guide site. A finished visual design (homepage) already exists as an exported Claude Design archive — **that export is the visual source of truth**. Your job: scaffold a real Next.js app, port the design faithfully, make it fully responsive, wire it to an existing Strapi CMS, and build the remaining pages by reusing the homepage's components and tokens.

Do **not** redesign. Replicate the look exactly, then add data and the missing pages.

---

## 0. What's in the design export (read these first)

The Claude Design archive contains:
- `Daffa Portfolio.dc.html` — the finished **homepage** (the only page designed). Its `<style>` block holds the full token system; its `<script>` holds the hero force-directed-graph animation and the theme toggle.
- `Daffa Style Direction.dc.html` — style notes ("Liquid-glass on a calm azure field").
- `dir-favicon.svg` / `uploads/dir-logo-text-only.svg` — the custom **/dir** logo (use as header logo + favicon).
- `uploads/frutiger-aero-palette.svg` — palette reference.
- `shots/*.png` — screenshots of the final design (`final-light.png`, `hero.png`, `nav-scrolled.png`, card states). **Verify your build against these.**

**First step:** open `Daffa Portfolio.dc.html`, copy the entire `:root` and `[data-theme="dark"]` custom-property blocks **verbatim** into `globals.css`. Do not re-derive the palette or glass values. The only token change: swap the font (see §3).

---

## 1. Stack & tooling

- **Next.js** (latest, App Router, TypeScript).
- **Tailwind CSS** + **shadcn/ui**.
- **next-themes** for light/dark.
- **@strapi/blocks-react-renderer** for Strapi `blocks` rich-text fields.
- Rendering: **SSG + ISR** (`export const revalidate = 60`), request-time rendering only for guestbook.
- Deploy target (configure but don't need to deploy yet): **Cloudflare Workers via `@opennextjs/cloudflare`**. Because of this, do **not** rely on the default Vercel image optimizer — use a custom `next/image` loader pointing at the Strapi media domain (see §4).

Suggested structure:
```
app/               # routes (see §6)
components/
  layout/          # nav (floating-on-scroll), footer, theme-toggle
  cards/           # project, article, tour, mkdir, experience-timeline-item
  hero/            # HeroGraph (client component; the force-directed canvas)
  blocks/          # StrapiBlocks renderer wrapper
  ui/              # shadcn primitives
lib/
  strapi.ts        # typed fetch client (base URL, populate helpers)
  types.ts         # content-type TS types
  image.ts         # media URL helper + next/image loader
  queries.ts       # per-page populate query strings
content/
  mkdir.ts         # temporary seed data for the mkdir feature (see §7)
styles/globals.css # tokens copied verbatim from the export
```

---

## 2. Design tokens (reference — copy the real ones from the export)

The export defines a **parametric glass system** plus light/dark palettes. Below is a summary for cross-check; the authoritative values live in `Daffa Portfolio.dc.html` — copy them exactly.

**Light (`:root`)**
- bg `#EFF5F1` · surface `#FFFFFF` · ink `#1B2E33` · ink-dim `#4E6569` · ink-faint `#6E8783` · border `#D8E6E0`
- sky `#5AA9D6` (sky-2 `#7FC0E2`, sky-ink `#2E7CA8`) — **primary accent**
- green `#5FB98A` (green-2 `#86CFA6`, green-ink `#3C8E63`) — secondary
- teal `#46B3AE` (teal-2 `#79CDC8`, teal-ink `#2E8783`) — bridge/connective
- glass: `--g-op-base:0.55`, `--g-blur-base:18px`, `--g-brd-base:0.66`, `--g-hi-base:0.92`, `--g-spec-base:0.85`; `backdrop-filter: blur(var(--glass-blur)) saturate(180%)`
- ambient blobs: green `rgba(191,227,207,0.55)`, sky `rgba(195,228,241,0.55)`, `--blob-op:0.22`, drift ~64s

**Dark (`[data-theme="dark"]`)**
- bg `#0F1E20` · surface `#15282A` · ink `#E7F1ED` · ink-dim `#9DB4B0` · ink-faint `#86A09B` · border `rgba(255,255,255,0.12)`
- sky `#74C2EA` · green `#72D3A0` · teal `#4FCFC6`
- glass: `--g-op-base:0.075`, `--g-brd-base:0.14`, `--g-hi-base:0.4`, glass-bg `rgba(255,255,255,0.07)`
- ambient blobs at `--blob-op:0.09`, drift ~130s

**Radius:** pills `999px`; cards `22px`; medium elements `13–15px`; small `10px`.
**Motion:** hover lift `-3px` (small) / `-8px` (cards); ambient float `9s`; respect `prefers-reduced-motion` (the export already gates this — keep it).

**Accent system:** `--accent` / `--accent-2` / `--accent-ink` switch between the sky/green/teal sets. Default primary = **sky**. Keep this switchable but ship with sky as primary.

---

## 3. Typography (CHANGED)

- **Body + headings: Inter** (weights 400–700). This replaces Space Grotesk everywhere in the export — update the Google Fonts link and every `font-family:'Space Grotesk',...` reference to Inter.
- **Monospace: JetBrains Mono** (400–500) — keep it for the logo, code, and the mkdir/terminal accents.
- Load both via `next/font/google` (self-hosted, no layout shift). Set `--font-sans: Inter`, `--font-mono: 'JetBrains Mono'`.

---

## 4. Theme behavior (light default, no system follow)

- `next-themes` with `attribute="data-theme"` (the CSS uses `[data-theme="dark"]`), `defaultTheme="light"`, **`enableSystem={false}`** — always light on first load, ignore the visitor's OS theme; the toggle still persists the user's choice.
- Port the export's toggle UI; the sun/moon icon must reflect state. Ensure headings/text use the theme-aware `--ink` token so they're readable in dark mode (this was a bug earlier — verify contrast in both modes).

---

## 5. Strapi integration (v5)

**Base URL:** `https://cms.daffa.me/api` (env `NEXT_PUBLIC_STRAPI_URL=https://cms.daffa.me`).
**Media domain:** `cms.daffa.me` — media URLs may be relative (`/uploads/...`); build absolute URLs and register the domain. Use a custom `next/image` loader (Cloudflare-safe) rather than the default optimizer.

**v5 response shape (important):**
- Flat: `{ data: { id, documentId, ...fields }, meta }` — **no `attributes` wrapper**.
- Fetch a single entry by **`documentId`**, not numeric id.
- Relations, components, and media are **not returned unless populated** — pass explicit `populate`. `populate=*` is one level only; nested (e.g. `featuredProjects.coverImage`, `gallery.image`, `route.image`) needs explicit nested populate. Put these in `lib/queries.ts` per page.
- `draftAndPublish` is on for most types → the public API returns **published only** (fine).

**`blocks` fields** (rich text) appear in: `home.intro`, `about.body`, `article.body`, `project.approach`, `project.result`, `tour-guide-landing.intro`, `tour-package.description` → render with `@strapi/blocks-react-renderer`.

**Data model (condensed):**

Single types: `home-page`, `about-page`, `tour-guide-landing-page`, `site-setting`.
Collection types: `project`, `article`, `skill`, `experience`, `tour-package`, `short-link`, `guestbook-message`.
Shared components: `seo`, `contact-link`, `cta`, `gallery-image`, `route-stop`, `price-option`, `notebook-resource`.

Key fields:
- **home-page**: fullName, headline, subheadline, intro(blocks), heroCtaPrimary/Secondary(cta), contactLinks(contact-link[]), seo; relations featuredSkills→skill, featuredExperiences→experience, featuredProjects→project, featuredArticles→article.
- **about-page**: title, subtitle, profileImage(media), body(blocks), contactLinks, seo; relations skills→skill, experiences→experience.
- **tour-guide-landing-page**: title, subtitle, heroImage(media), intro(blocks), whyChooseMe(json), contactLinks, primaryCta(cta), seo; relation featuredTours→tour-package.
- **site-setting**: siteName, footerText, copyrightText, email, whatsappUrl, defaultSeo(seo), contactLinks. → **global layout data** (nav/footer/contact/default SEO); fetch once in the root layout.
- **project**: title, slug(uid), summary, coverImage(media), gallery(gallery-image[]), problem, approach(blocks), result(blocks), techStack(json), projectType(enum incl. `gis`), projectStatus(enum), year, githubUrl, liveDemoUrl, dashboardUrl, notebookResources(notebook-resource[]), isFeatured, seo; relation relatedArticles↔article (m2m).
- **article**: title, slug(uid), excerpt, coverImage(media), body(blocks), category(enum), tags(json), **language(enum en/id/de)**, isFeatured, publishedDate, seo; relation relatedProjects↔project (m2m).
- **skill**: name, category(enum), level(enum), description, isFeatured, order.
- **experience**: title, organization, location, experienceType(enum), startDate, endDate, isCurrent, description, gallery, sortOrder, isFeatured.
- **tour-package**: title, slug(uid), shortDescription, coverImage(media), gallery, description(blocks), route(route-stop[] with mapUrl/locationText/image/order), duration, meetingPoint, suitableFor/notSuitableFor/whatToPrepare/included/excluded(json), priceOption(price-option[]), bookingContact(contact-link[]), availabilityNote, isFeatured, seo.
- **short-link**: title, slug(unique), destinationUrl, isActive, expiresAt, clickCount, lastClickedAt, source(enum), tags(json). → redirect service.
- **guestbook-message**: message(3–1000, required), displayName, isAnonymous, isVisible, isPinned, category(enum), submittedAt, reply, repliedAt, moderationStatus(enum, default `visible`), moderationNote.

**Component shapes:** seo(metaTitle, metaDescription, ogImage(media), canonicalUrl, noIndex); contact-link(label, url, linkType enum, icon, isPrimary, sortOrder); cta(label, url, style enum, description); gallery-image(image(media), alt, caption, order); route-stop(title, description, locationText, mapUrl, image(media), order); price-option(title, price(decimal), currency enum, description); notebook-resource(title, kind enum incl. `map`, file(media), url, embedUrl, description, order).

---

## 6. Routes / sitemap — build ALL of these

Every content type must surface somewhere (the design only covered the homepage). Reuse homepage components + tokens for visual consistency.

**Career / personal**
- `/` — home-page (hero + featured skills/experiences/projects/articles). *(Already designed — port it.)*
- `/about` — about-page (body blocks + skills + experiences timeline + contact).
- `/projects` — list of `project` (grid of project cards). Support filtering by `projectType` (badges), including `gis`.
- `/projects/[slug]` — project detail: problem / approach(blocks) / result(blocks), gallery, techStack chips, notebookResources (render embeds — jupyter/html_export/interactive_chart/dashboard/**map**), links (github/liveDemo/dashboard), related articles.
- `/articles` — list of `article`, with a **language filter (EN/ID/DE)** and category badges.
- `/articles/[slug]` — article detail: cover image, body(blocks), tags, related projects, language badge.
- `/mkdir` — **NEW feature** (see §7).

**Tour guide**
- `/tours` — tour-guide-landing-page (intro + whyChooseMe + featured tours).
- `/tours/[slug]` — tour-package detail: description(blocks), route (render route-stops as a connected list/map), duration, meeting point, suitable/not-suitable/prepare/included/excluded, price options, booking contact, gallery.

**Utility / global**
- `/guestbook` — read visible messages + a form to submit a new one (see §8). **This was missing from the design — build it on-brand using glass cards.**
- `/s/[slug]` — short-link redirect via a route handler (look up `short-link` by slug, redirect to `destinationUrl`; ideally increment `clickCount`/`lastClickedAt` server-side). If inactive/expired, 404.
- `site-setting` → consumed in the root layout for nav, footer, contact links, default SEO.

**Nav:** logo (/dir) only on the left (no name text). Links: Home, Projects, Articles, mkdir, Tours, About. Guestbook can live in the nav or footer. The header must **float into a detached frosted bar on scroll** (already designed — preserve).

**SEO:** per-page metadata from each type's `seo` component, falling back to `site-setting.defaultSeo`. Use Next.js `generateMetadata`.

---

## 7. NEW feature: `mkdir` (frontend now, backend later)

`mkdir` = "**M**emoar **K**ontemplasi **D**affa **IR**" — a short-form micro-blog of casual, random thoughts/observations, distinct from the formal, structured `article` feature. It's thematically tied to the `/dir` logo and the unix/terminal motif (`mkdir` = make directory).

**Now (frontend only):** the Strapi content type does **not** exist yet. Read entries from a local seed file `content/mkdir.ts` through a single accessor `getMkdirEntries()` / `getMkdirEntry(slug)` whose return shape matches the **intended** Strapi model below — so switching to the real API later is a one-function change (swap the body of the accessor to `GET /api/mkdir-entries`). Ship 3–4 sample entries.

**Intended future Strapi collection type `mkdir-entry`** (for consistency — do NOT create it now, just match the shape):
```
title?: string
slug: uid
body: blocks           # short
mood: enum(thought | observation | note | question | fragment)
tags?: json
language: enum(en | id | de)
publishedDate: date
isPinned?: boolean
```

**Visual:** a feed of small, casual "memo" cards — lighter and more compact than article cards, with monospace (JetBrains Mono) accents and a terminal-flavored section header (e.g. `$ mkdir ~/memoar`). Same glass tokens, but a more relaxed, note-like tone. Optionally `/mkdir/[slug]` for a single memo, or an inline expand — your call, keep it simple. Must reuse the site's tokens and be fully responsive.

---

## 8. Guestbook write path (secure)

- **Read:** list messages where `moderationStatus === "visible"` and `isVisible === true`; show `isPinned` first. Render as glass cards (name or "Anonymous", message, category badge, date; show `reply` if present).
- **Write:** a form (message required 3–1000, optional displayName, isAnonymous, category). Submit through a **Next.js route handler / server action** that calls Strapi with a **server-only API token** (`STRAPI_API_TOKEN`, never exposed to the browser). Do **not** enable public create on Strapi directly.
- New submissions should default to a **pending/hidden** state (set `moderationStatus`) so you can approve them in Strapi before they appear.
- Add basic anti-spam: a honeypot field + simple server-side rate limiting.

---

## 9. Responsiveness (CRITICAL — the export is not responsive)

The Claude Design output **compresses** elements on smaller viewports instead of stacking them. Rebuild every layout **mobile-first**:
- Use responsive Tailwind (`flex-wrap`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, stack on small screens). Never rely on fixed widths that squash.
- **Hero:** two-column (text + graph) on desktop → **stacked** on mobile (graph moves below the text, or renders smaller/simplified). Keep the force-graph performant on mobile.
- **Nav:** collapses to a mobile menu (hamburger) under `md`; the floating-on-scroll behavior still applies.
- **Experiences timeline:** stays a single connected vertical line on all sizes (newest→oldest).
- Fluid type with `clamp()`; container `max-width` + responsive padding.
- **Test at 375px, 768px, 1024px, 1440px** and confirm nothing overlaps or compresses — elements should reflow/stack.

---

## 10. Environment variables

```
NEXT_PUBLIC_STRAPI_URL=https://cms.daffa.me
STRAPI_API_TOKEN=            # server-only; for guestbook POST (and any protected reads)
```

---

## 11. How to work (to minimize revisions)

1. Scaffold the Next.js app; copy the export's `:root` / `[data-theme="dark"]` tokens verbatim into `globals.css`; wire Inter + JetBrains Mono; set up next-themes (light default).
2. Port the **homepage** from `Daffa Portfolio.dc.html` into React components (nav, hero + HeroGraph client component, sections, cards, footer). Match `shots/final-light.png` and `shots/hero.png`. Keep the parametric glass CSS variables and the reduced-motion gating.
3. Build the Strapi client (`lib/strapi.ts`, `queries.ts`, `types.ts`, image loader) and wire the homepage to live data from `cms.daffa.me`.
4. Build the remaining pages (§6) reusing homepage components; add the `mkdir` feature (§7) and guestbook (§8).
5. Make everything responsive (§9); verify at the listed breakpoints.
6. Work page-by-page, showing diffs; don't redesign — replicate then wire.

Ask before any structural deviation from the exported design.
