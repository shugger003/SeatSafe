import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/csp";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot", "/admin/reset"]);

const CLOSED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>ASAS SitSafe</title>
<style>
  html,body{margin:0;height:100%}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#c2185b;color:#fff6f8}
  h1{margin:0;max-width:14ch;padding:40px 28px;text-align:center;font-family:Palatino,"Palatino Linotype",Georgia,serif;font-size:clamp(42px,8vw,92px);font-weight:500;line-height:1.02}
</style>
</head>
<body>
<h1>This website is currently under development.</h1>
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

function shopIsHeld(pathname: string) {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (shopIsHeld(pathname)) {
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
