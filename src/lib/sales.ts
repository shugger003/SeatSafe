import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

export type SalesDay = {
  key: string;
  label: string;
  revenueMinor: number;
  bottles: number;
  orders: number;
};

export type SalesSnapshot = {
  days: SalesDay[];
  today: SalesDay;
  weekRevenueMinor: number;
  weekBottles: number;
  weekOrders: number;
  waitingMinor: number;
  waitingOrders: number;
};

function dayParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = value("day");
  return {
    key: `${value("year")}-${value("month")}-${day}`,
    label: `${value("weekday")} ${Number(day)}`,
  };
}

function bottlesIn(lineItems: unknown) {
  if (!Array.isArray(lineItems)) return 0;
  return lineItems.reduce((sum, line) => {
    const quantity = Number((line as { quantity?: unknown }).quantity);
    return sum + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
}

export async function salesSnapshot(timeZone: string): Promise<SalesSnapshot> {
  const zone = timeZone || "Africa/Accra";
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const when = new Date(now.getTime() - (6 - index) * 86_400_000);
    const part = dayParts(when, zone);
    return { key: part.key, label: part.label, revenueMinor: 0, bottles: 0, orders: 0 };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));
  const since = new Date(now.getTime() - 8 * 86_400_000).toISOString();
  const result = await supabaseAdmin()
    .from("orders")
    .select("payment_status,total_minor,created_at,line_items")
    .gte("created_at", since);
  if (result.error) throw new Error("Database request failed.");

  let waitingMinor = 0;
  let waitingOrders = 0;
  for (const row of result.data ?? []) {
    const status = String(row.payment_status ?? "");
    const total = Number(row.total_minor ?? 0);
    if (status === "pending") {
      waitingMinor += Number.isFinite(total) ? total : 0;
      waitingOrders += 1;
      continue;
    }
    if (status !== "paid") continue;
    const key = dayParts(new Date(String(row.created_at)), zone).key;
    const day = byKey.get(key);
    if (!day) continue;
    day.revenueMinor += Number.isFinite(total) ? total : 0;
    day.bottles += bottlesIn(row.line_items);
    day.orders += 1;
  }

  const today = days[days.length - 1] ?? { key: "", label: "Today", revenueMinor: 0, bottles: 0, orders: 0 };
  return {
    days,
    today,
    weekRevenueMinor: days.reduce((sum, day) => sum + day.revenueMinor, 0),
    weekBottles: days.reduce((sum, day) => sum + day.bottles, 0),
    weekOrders: days.reduce((sum, day) => sum + day.orders, 0),
    waitingMinor,
    waitingOrders,
  };
}
