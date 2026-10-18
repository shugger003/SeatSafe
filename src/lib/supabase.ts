import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }
  const cached = globalThis as typeof globalThis & { __seatSupabase?: SupabaseClient };
  cached.__seatSupabase ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached.__seatSupabase;
}

export async function rpc<T>(fn: string, args: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin().rpc(fn, args);
  if (error) {
    const message = error.message || "";
    if (message.includes("STOCK")) throw new Error("STOCK");
    if (message.includes("DISCOUNT")) throw new Error("DISCOUNT");
    console.error("database_rpc_failed", fn);
    throw new Error("Database request failed.");
  }
  return data as T;
}
