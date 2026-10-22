import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export function refreshCatalog() {
  try {
    revalidateTag("catalog", "max");
    revalidatePath("/", "layout");
  } catch {
    // Vitest and other callers can run outside a Next render.
  }
}

export function catalogCached<T>(key: string, fn: () => Promise<T>, seconds = 60) {
  return unstable_cache(fn, ["catalog", key], { revalidate: seconds, tags: ["catalog"] })();
}
