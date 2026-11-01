import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_CLOSED_HOSTS, publicSiteClosed } from "@/lib/public-access";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot", "/admin/reset"]);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;
  if (publicSiteClosed() && PUBLIC_CLOSED_HOSTS.has(host) && pathname !== "/unavailable" && !pathname.startsWith("/api/moolre/webhook")) {
    const url = request.nextUrl.clone();
    url.pathname = "/unavailable";
    url.search = "";
    return NextResponse.rewrite(url);
  }
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
