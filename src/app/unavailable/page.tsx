import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { live } from "@/lib/live";
import { publicSiteClosed } from "@/lib/public-access";

export const metadata: Metadata = {
  title: "Back at 6:00 p.m.",
  description: "ASAS SitSafe will not be available until 6:00 p.m.",
  robots: { index: false, follow: false },
};

export default async function UnavailablePage() {
  await live();
  if (!publicSiteClosed()) redirect("/");

  return (
    <main id="main" className="flex min-h-dvh flex-col bg-paper">
      <p className="bg-pine px-5 py-3 text-center text-sm font-semibold text-paper" role="status">
        This site will not be available until 6:00 p.m.
      </p>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">ASAS SitSafe</p>
        <h1 className="mt-4 max-w-md font-display text-4xl leading-tight text-ink sm:text-5xl">We open at 6:00 p.m.</h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
          The shop is closed until 6:00 p.m. today, Ghana time. Please come back then.
        </p>
      </div>
    </main>
  );
}
