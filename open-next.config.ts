import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

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
 * Tag cache: intentionally left as the default. The app uses purely time-based ISR — no
 * `revalidateTag`/`revalidatePath` anywhere — and a tag cache is only needed for those.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
});
