import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * On-demand revalidation for Strapi publish webhooks.
 *
 * Every route is time-based ISR with a deliberately long window (1h, 1d for about/tours,
 * 5m for the guestbook) because the Workers free plan only allows 10ms CPU per request.
 * Those windows stay exactly as they are; this endpoint adds the push signal so an editor
 * doesn't wait an hour to see a change.
 *
 * `revalidatePath(p)` writes the tag `_N_T_<p>` into the D1 tag cache (see
 * open-next.config.ts). Next stamps the same implicit tags onto every cached page, so the
 * next request for a matching page misses the cache and re-renders. Because
 * `lib/strapi.ts` deliberately keeps no fetch cache, that re-render always reads fresh
 * data from the CMS — no fetch-level tagging is needed anywhere in the data layer.
 */

/** Paths used when we can't tell what changed — cheap, and plausibly affected by anything. */
const SAFE_MINIMUM: PathSpec[] = [["/"], ["/sitemap.xml"]];

/**
 * A path, optionally with Next's `type` argument.
 *
 * `["/articles", "layout"]` writes `_N_T_/articles/layout`, which every page under
 * /articles carries — so ONE tag invalidates the list and all detail pages at once. That
 * is both cheaper than enumerating slugs (one D1 row instead of N) and immune to renames.
 */
type PathSpec = [path: string] | [path: string, type: "layout" | "page"];

/** Content type → the routes its content appears on. Keys are Strapi model names. */
const ROUTES: Record<string, PathSpec[]> = {
  // Detail slug is appended at request time when the payload carries one.
  article: [["/articles", "layout"], ["/"], ["/sitemap.xml"]],
  project: [["/projects", "layout"], ["/"], ["/services"], ["/sitemap.xml"]],
  "tour-package": [["/tours", "layout"], ["/"], ["/sitemap.xml"]],

  "tour-guide-landing-page": [["/tours"]],
  "home-page": [["/"], ["/sitemap.xml"]],
  "about-page": [["/about"], ["/sitemap.xml"]],

  "service-page": [["/services"]],
  "service-package": [["/services"]],
  "service-addon": [["/services"]],

  // Populated as `technologies` on projects (home, list, detail, services) and as
  // `skills` on about-page — see the populate map in lib/queries.ts.
  skill: [["/about"], ["/projects", "layout"], ["/services"], ["/"]],
  // `featuredExperiences` on home-page, `experiences` on about-page.
  experience: [["/"], ["/about"]],

  "terminal-command": [["/mkdir"]],
  "guestbook-message": [["/guestbook"]],

  // Feeds metadata and the footer on EVERY route, so this is the one legitimate use of the
  // site-wide layout tag. It expires every page, meaning the next visitor to each one pays
  // a full render — deploy-sized, fine occasionally, not for routine edits.
  "site-setting": [["/", "layout"]],
};

/** Models whose detail pages are `/<segment>/<slug>`. */
const DETAIL_SEGMENT: Record<string, string> = {
  article: "/articles",
  project: "/projects",
  "tour-package": "/tours",
};

/** Spellings Strapi might send (plural / pluralApiId) mapped onto the canonical key. */
const ALIASES: Record<string, string> = {
  articles: "article",
  projects: "project",
  "tour-packages": "tour-package",
  skills: "skill",
  experiences: "experience",
  "service-packages": "service-package",
  "service-addons": "service-addon",
  "terminal-commands": "terminal-command",
  "guestbook-messages": "guestbook-message",
  guestbook: "guestbook-message",
  "site-settings": "site-setting",
};

function describe([path, type]: PathSpec): string {
  return type ? `${path} (${type})` : path;
}

/**
 * Constant-time secret comparison.
 *
 * Both sides are hashed first so the loop always runs over 32 bytes — a plain character
 * comparison would leak the secret's length through timing even if it were otherwise
 * constant-time. Web Crypto rather than node:crypto so it behaves identically on Workers.
 */
async function secretMatches(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < va.length; i += 1) diff |= va[i]! ^ vb[i]!;
  return diff === 0;
}

/** Reads the shared secret from headers only — never from the query string. */
function presentedSecret(req: Request): string | null {
  const header = req.headers.get("x-revalidate-secret");
  if (header) return header;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return null;
}

/** `api::article.article` → `article`; falls back to the payload's `model` field. */
function resolveModel(body: Record<string, unknown>): string | null {
  const uid = typeof body.uid === "string" ? body.uid : null;
  const fromUid = uid?.includes("::") ? (uid.split("::")[1]?.split(".")[0] ?? null) : null;
  const raw = fromUid || (typeof body.model === "string" ? body.model : null);
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return ALIASES[key] ?? key;
}

function entrySlug(body: Record<string, unknown>): string | null {
  const entry = body.entry;
  if (!entry || typeof entry !== "object") return null;
  const slug = (entry as Record<string, unknown>).slug;
  return typeof slug === "string" && slug.trim() !== "" ? slug.trim() : null;
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // No request could ever be valid, so 401 would send the caller hunting the wrong
    // problem. 503 + a log points at the actual cause: a missing Worker secret.
    console.error("Revalidate: REVALIDATE_SECRET is not set.");
    return NextResponse.json({ ok: false, error: "Revalidation is not configured." }, { status: 503 });
  }

  // A secret in the URL can never authenticate here, and it would be logged by every proxy
  // in between. Say so explicitly rather than returning an opaque 401.
  const query = new URL(req.url).searchParams;
  if (query.has("secret") || query.has("token")) {
    return NextResponse.json(
      { ok: false, error: "Send the secret in the x-revalidate-secret header, not the query string." },
      { status: 400 },
    );
  }

  const provided = presentedSecret(req);
  if (!provided || !(await secretMatches(provided, expected))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  // Past this point the caller is trusted, so nothing below may throw: a 500 back to Strapi
  // is far less useful than a 200 saying exactly what was (and wasn't) revalidated.
  let body: Record<string, unknown> = {};
  let malformed = false;
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    } else {
      malformed = true;
    }
  } catch {
    malformed = true;
  }

  const event = typeof body.event === "string" ? body.event : null;
  const skipped: string[] = [];

  // Strapi's "Trigger" button in the webhook UI sends this with no entry attached.
  if (event === "trigger-test") {
    return NextResponse.json({ ok: true, event, model: null, revalidated: [], skipped: [] });
  }

  let model: string | null = null;
  let specs: PathSpec[];

  const manual = body.paths;
  if (Array.isArray(manual)) {
    // Authenticated manual override — a purge lever that doesn't need a redeploy.
    specs = [];
    for (const entry of manual) {
      if (typeof entry === "string" && entry.startsWith("/")) specs.push([entry]);
      else skipped.push(`invalid path: ${JSON.stringify(entry)}`);
    }
  } else if (malformed) {
    console.warn("Revalidate: malformed body, falling back to the safe minimum.");
    skipped.push("malformed body");
    specs = SAFE_MINIMUM;
  } else {
    model = resolveModel(body);
    const mapped = model ? ROUTES[model] : undefined;
    if (!mapped) {
      console.warn(`Revalidate: no route mapping for model "${model ?? "(none)"}" (event: ${event ?? "none"}).`);
      skipped.push(model ? `unmapped model: ${model}` : "no model in payload");
      specs = SAFE_MINIMUM;
    } else {
      specs = [...mapped];
      const segment = DETAIL_SEGMENT[model!];
      if (segment) {
        const slug = entrySlug(body);
        // The section layout tag above already covers the detail page; naming it too is
        // for the response log, so a webhook delivery shows the exact page it touched.
        if (slug) specs.push([`${segment}/${slug}`]);
        else skipped.push(`no slug in entry — ${segment}/<slug> not revalidated individually`);
      }
    }
  }

  const revalidated: string[] = [];
  for (const spec of specs) {
    try {
      const [path, type] = spec;
      if (type) revalidatePath(path, type);
      else revalidatePath(path);
      revalidated.push(describe(spec));
    } catch (err) {
      console.error(`Revalidate: failed for ${describe(spec)}:`, err);
      skipped.push(`failed: ${describe(spec)}`);
    }
  }

  return NextResponse.json({ ok: true, event, model, revalidated, skipped });
}
