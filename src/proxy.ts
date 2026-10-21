import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot", "/admin/reset"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 16) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") throw new Error("role");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
