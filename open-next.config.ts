import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Without an explicit `incrementalCache`, the adapter defaults to the "dummy" cache whose
 * get/set *throw on every call* — so nothing is ever cached and every request that reaches
 * the Worker performs a full React SSR render. On the Workers free plan (10ms CPU/request)
 * that is what produced the recurring "Error 1102 — Exceeded CPU Time Limits".
 *
 * R2 persists rendered output so requests become cache READS (I/O, which does not count
 * toward the CPU limit) instead of re-renders. `withRegionalCache` layers the colocated
 * Cache API in front of R2, so repeat hits in the same region skip the R2 round trip too.
 *
 * Queue: `memoryQueue` performs background ISR revalidation via the WORKER_SELF_REFERENCE
 * service binding. Chosen over `doQueue` because it needs no Durable Object namespace; its
 * only weakness is per-isolate de-duplication, which is immaterial at this traffic level.
 * (`doQueue` is the upgrade path if logs ever show redundant revalidations.)
 *
 * Tag cache: D1, backing the `revalidatePath` calls in app/api/revalidate (the Strapi
 * publish webhook). Without it the adapter's default "dummy" tag cache makes those calls
 * silent no-ops. D1 over the Durable-Object sharded variant because it is strongly
 * consistent — a publish is visible on the very next request — and the docs only recommend
 * sharding for high load or frequent revalidation, neither of which applies here.
 *
 * Cost: one D1 `SELECT ... WHERE tag IN (...)` per ISR cache read, deduplicated to a single
 * round trip per request by the adapter's request-scoped memo. That is I/O, which does not
 * count against the 10ms CPU budget, and every D1 method fails open (catch → false), so an
 * outage degrades to plain time-based ISR rather than errors.
 *
 * Do NOT wrap this in `withFilter({ filterFn: softTagFilter })`. The docs suggest it to cut
 * tag-cache traffic, but it drops every `_N_T_`-prefixed tag — exactly the namespace
 * `revalidatePath` writes into — so on-demand revalidation would silently stop working.
 *
 * The `revalidations` table is created automatically by `opennextjs-cloudflare deploy`
 * (populate-cache resolves the NEXT_TAG_CACHE_D1 binding by name); there is no separate
 * migration step, and `next build` is unaffected.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
  tagCache: d1NextTagCache,
});
