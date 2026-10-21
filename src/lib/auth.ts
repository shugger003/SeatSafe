import "server-only";
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { credentialForEmail, storedCredential, verifyPasswordHash } from "@/lib/admin-credentials";

const COOKIE = "admin_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) return null;
  return new TextEncoder().encode(value);
}

export function adminConfigured() {
  return Boolean(secret() && process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD)));
}

export function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

async function envPasswordMatches(password: string) {
  const stored = await storedCredential();
  if (stored) return verifyPasswordHash(password, stored.hash);
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyPasswordHash(password, hash);
  if (process.env.NODE_ENV === "production") return false;
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  const left = Buffer.from(password);
  const right = Buffer.from(plain);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function loginAdmin(email: string, password: string) {
  const key = secret();
  if (!key) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const user = await credentialForEmail(normalized);
  const ok = user
    ? verifyPasswordHash(password, user.hash)
    : normalized === adminEmail() && adminConfigured()
      ? await envPasswordMatches(password)
      : false;
  if (!ok) return null;
  return new SignJWT({ email: normalized, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key);
}

export async function getSession() {
  const key = secret();
  if (!key) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    const user = await credentialForEmail(payload.email);
    if (user && ((payload.iat ?? 0) + 1) * 1000 < user.changedAt) return null;
    if (!user && payload.email === adminEmail()) {
      const stored = await storedCredential();
      if (stored && ((payload.iat ?? 0) + 1) * 1000 < stored.changedAt) return null;
    }
    if (!user && payload.email !== adminEmail()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE };
