"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sendAdminSms } from "@/lib/admin-sms";

function bounce(path: string, message: string): never {
  redirect(`${path}?notice=${encodeURIComponent(message)}`);
}

function adminReturnPath(value: string) {
  const path = value.split("?")[0]?.split("#")[0] || "";
  if (!/^\/admin(\/[A-Za-z0-9/_-]*)?$/.test(path)) return "/admin/sms";
  return path;
}

export async function sendSmsAction(formData: FormData) {
  const session = await getSession();
  if (!session) bounce("/admin/login", "Sign in required.");
  const returnTo = adminReturnPath(String(formData.get("returnTo") || ""));
  const result = await sendAdminSms(session.email, {
    phone: String(formData.get("phone") || ""),
    message: String(formData.get("message") || ""),
    network: String(formData.get("network") || ""),
    orderId: String(formData.get("orderId") || ""),
  });
  bounce(returnTo, result.ok ? "SMS sent." : result.message);
}
