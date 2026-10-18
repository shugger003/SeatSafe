"use client";

import { useEffect, useState } from "react";

export function track(event: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_ANALYTICS_ID) return;
  if (window.localStorage.getItem("analytics-consent") !== "granted") return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", event, params);
}

export function AnalyticsGate() {
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(window.localStorage.getItem("analytics-consent"));
  }, []);

  useEffect(() => {
    if (!id || consent !== "granted") return;
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.async = true;
    document.head.appendChild(script);
    const setup = document.createElement("script");
    setup.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js', new Date());gtag('config', '${id}', { anonymize_ip: true });`;
    document.head.appendChild(setup);
  }, [consent, id]);

  if (!id || consent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg rounded-[16px] border border-line bg-surface p-4 shadow-soft sm:left-auto">
      <p className="text-sm leading-6">Optional analytics can record shopping events such as product views and completed purchases. It stays off unless you accept.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-[10px] bg-pine px-4 text-sm text-paper"
          onClick={() => {
            localStorage.setItem("analytics-consent", "granted");
            setConsent("granted");
          }}
        >
          Accept
        </button>
        <button
          type="button"
          className="min-h-11 rounded-[10px] border border-line px-4 text-sm"
          onClick={() => {
            localStorage.setItem("analytics-consent", "denied");
            setConsent("denied");
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export function PurchaseBeacon({ orderNumber, totalMinor, currency, paid }: { orderNumber: string; totalMinor: number; currency: string; paid: boolean }) {
  useEffect(() => {
    if (!paid) return;
    const key = `tracked-${orderNumber}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    track("purchase", { transaction_id: orderNumber, value: totalMinor / 100, currency });
  }, [currency, orderNumber, paid, totalMinor]);
  return null;
}
