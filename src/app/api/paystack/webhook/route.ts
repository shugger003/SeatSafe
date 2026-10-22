export async function POST() {
  return new Response("This store uses Moolre. Send payment callbacks to /api/moolre/webhook.", { status: 404 });
}
