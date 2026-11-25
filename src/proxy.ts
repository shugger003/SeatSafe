import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/csp";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot", "/admin/reset"]);
/** 6:00 p.m. Ghana time on 1 November 2026. Accra stays on GMT. */
const PUBLIC_CLOSED_UNTIL = Date.parse("2026-11-01T18:00:00.000Z");
const PUBLIC_CLOSED_HOSTS = new Set([
  "sitsafe.com",
  "www.sitsafe.com",
  "sitsafe.company",
  "www.sitsafe.company",
  "seatshieldghana.com",
  "www.seatshieldghana.com",
]);

const CLOSED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Back at 6:00 p.m.</title>
<style>
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:#fff6f8;color:#2a121c;font-family:"Segoe UI",sans-serif}
  .banner{margin:0;background:#c2185b;color:#fff6f8;text-align:center;padding:12px 20px;font-size:14px;font-weight:650}
  main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:64px 24px}
  .brand{margin:0;color:#c2185b;letter-spacing:.18em;text-transform:uppercase;font-size:12px;font-weight:700}
  h1{margin:16px 0 0;max-width:12ch;font-family:Palatino,"Palatino Linotype",Georgia,serif;font-size:44px;font-weight:500;line-height:1.1}
  .note{margin:16px 0 0;max-width:32ch;color:#6b4454;font-size:16px;line-height:1.5}
</style>
</head>
<body>
<p class="banner" role="status">This site will not be available until 6:00 p.m.</p>
<main>
<p class="brand">ASAS SitSafe</p>
<h1>We open at 6:00 p.m.</h1>
<p class="note">The shop is closed until 6:00 p.m. today, Ghana time. Please come back then.</p>
</main>
</body>
</html>`;

function secure(response: NextResponse, request?: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");
  if (request) {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", policy);
    const next = NextResponse.next({ request: { headers } });
    next.headers.set("Content-Security-Policy", policy);
    return next;
  }
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;
  if (Date.now() < PUBLIC_CLOSED_UNTIL && PUBLIC_CLOSED_HOSTS.has(host) && !pathname.startsWith("/api/moolre/webhook")) {
    return secure(
      new NextResponse(CLOSED_PAGE, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-robots-tag": "noindex",
        },
      }),
    );
  }
  if (!pathname.startsWith("/admin") || PUBLIC_ADMIN_PATHS.has(pathname)) return secure(NextResponse.next(), request);
  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 16) {
    return secure(NextResponse.redirect(new URL("/admin/login", request.url)));
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") throw new Error("role");
    return secure(NextResponse.next(), request);
  } catch {
    return secure(NextResponse.redirect(new URL("/admin/login", request.url)));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
