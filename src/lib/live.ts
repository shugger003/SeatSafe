import { connection } from "next/server";

/** Marks the render as request-time so prices, stock, and dates stay current. */
export async function live() {
  await connection();
}
