import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { newId } from "@/lib/safe";
import { supabaseAdmin } from "@/lib/supabase";

const RESET_MINUTES = 30;
const RESETS_PER_HOUR = 3;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPasswordHash(password: string, hash: string) {
  const [salt, stored] = hash.split(":");
  if (!salt || !stored) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(stored, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function envAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

export async function credentialForEmail(email: string): Promise<{ hash: string; changedAt: number } | null> {
  const result = await supabaseAdmin().from("admin_users").select("password_hash, changed_at").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (result.error) throw new Error("Could not read admin credentials.");
  if (!result.data) return null;
  return { hash: String(result.data.password_hash), changedAt: new Date(String(result.data.changed_at)).getTime() };
}

export async function isKnownAdmin(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === envAdminEmail()) return true;
  return Boolean(await credentialForEmail(normalized));
}

export async function storedCredential(): Promise<{ hash: string; changedAt: number } | null> {
  const result = await supabaseAdmin().from("admin_credentials").select("password_hash, changed_at").eq("id", 1).maybeSingle();
  if (result.error) throw new Error("Could not read admin credentials.");
  if (!result.data) return null;
  return { hash: String(result.data.password_hash), changedAt: new Date(String(result.data.changed_at)).getTime() };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Returns a fresh reset token, or null when too many were requested in the last hour. */
export async function createResetToken(email: string) {
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const recent = await supabaseAdmin().from("admin_password_resets").select("id", { count: "exact", head: true }).gte("created_at", since);
  if (recent.error) throw new Error("Could not check reset requests.");
  if ((recent.count ?? 0) >= RESETS_PER_HOUR) return null;
  const token = randomBytes(32).toString("base64url");
  const inserted = await supabaseAdmin().from("admin_password_resets").insert({
    id: newId(),
    token_hash: tokenHash(token),
    email: email.trim().toLowerCase(),
    expires_at: new Date(Date.now() + RESET_MINUTES * 60_000).toISOString(),
  });
  if (inserted.error) throw new Error("Could not create a reset link.");
  return token;
}

export async function resetTokenValid(token: string) {
  if (!token) return false;
  const result = await supabaseAdmin()
    .from("admin_password_resets")
    .select("id")
    .eq("token_hash", tokenHash(token))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return Boolean(result.data);
}

async function savePasswordForEmail(email: string, password: string) {
  const now = new Date().toISOString();
  const hash = hashPassword(password);
  const user = await credentialForEmail(email);
  if (user) {
    const saved = await supabaseAdmin().from("admin_users").update({ password_hash: hash, changed_at: now }).eq("email", email);
    if (saved.error) throw new Error("Could not save the new password.");
    return;
  }
  if (email === envAdminEmail()) {
    const saved = await supabaseAdmin().from("admin_credentials").upsert({ id: 1, password_hash: hash, changed_at: now });
    if (saved.error) throw new Error("Could not save the new password.");
  }
}

/** Uses up the token and saves the new password. Returns false if the token was expired or already used. */
export async function resetPassword(token: string, password: string) {
  const now = new Date().toISOString();
  const claimed = await supabaseAdmin()
    .from("admin_password_resets")
    .update({ used_at: now })
    .eq("token_hash", tokenHash(token))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("id, email");
  if (claimed.error || !claimed.data?.length) return false;
  const email = String(claimed.data[0].email || envAdminEmail()).trim().toLowerCase();
  if (!email) return false;
  await savePasswordForEmail(email, password);
  await supabaseAdmin().from("admin_password_resets").update({ used_at: now }).is("used_at", null);
  return true;
}
