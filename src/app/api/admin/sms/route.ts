import { getSession } from "@/lib/auth";
import { sendAdminSms } from "@/lib/admin-sms";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false, message: "Sign in required." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ ok: false, message: "Send JSON." }, { status: 415 });
  }

  let body: { phone?: unknown; message?: unknown; network?: unknown; orderId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const result = await sendAdminSms(session.email, {
    phone: typeof body.phone === "string" ? body.phone : "",
    message: typeof body.message === "string" ? body.message : "",
    network: typeof body.network === "string" ? body.network : "",
    orderId: typeof body.orderId === "string" ? body.orderId : "",
  });
  if (!result.ok) return Response.json({ ok: false, message: result.message }, { status: result.status });
  return Response.json({ ok: true });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
