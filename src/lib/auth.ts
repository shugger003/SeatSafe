import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "admin_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) return null;
  return new TextEncoder().encode(value);
}

export function adminConfigured() {
  return Boolean(secret() && process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD)));
}

function passwordMatches(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const [salt, stored] = hash.split(":");
    if (!salt || !stored) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(stored, "hex");
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
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
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!key || !expected || !adminConfigured()) return null;
  const emailOk = email.trim().toLowerCase() === expected;
  const passwordOk = passwordMatches(password);
  if (!emailOk || !passwordOk) return null;
  return new SignJWT({ email: expected, role: "admin" })
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
