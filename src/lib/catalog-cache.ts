import { revalidateTag, unstable_cache, updateTag } from "next/cache";

const CATALOG = "catalog-3";

/**
 * Expire catalog data after a save or a stock change.
 * Server Actions drop it immediately. The payment webhook, which is not an action, does the same.
 * The tag is enough: wiping the whole site layout would throw away every other cached page.
 */
export function refreshCatalog() {
  try {
    updateTag(CATALOG);
  } catch {
    try {
      revalidateTag(CATALOG, { expire: 0 });
    } catch {
      // Vitest and other callers can run outside a Next render.
    }
  }
}

/** Public catalog reads. `key` separates one result from another. Writes call refreshCatalog. */
export function catalogCached<T>(key: string, load: () => Promise<T>, seconds = 300) {
  return unstable_cache(load, [CATALOG, key], { revalidate: seconds, tags: [CATALOG] })();
}
