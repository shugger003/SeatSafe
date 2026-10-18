import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(name)) return new Response("Not found", { status: 404 });
  const root = path.join(process.cwd(), "data", "uploads");
  const file = path.join(root, name);
  if (!file.startsWith(root)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const type = name.endsWith(".png") ? "image/png" : name.endsWith(".webp") ? "image/webp" : name.endsWith(".gif") ? "image/gif" : "image/jpeg";
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
