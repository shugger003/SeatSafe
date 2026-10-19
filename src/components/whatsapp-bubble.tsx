"use client";

import { usePathname } from "next/navigation";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
import { cn } from "@/lib/cn";

export function WhatsAppBubble({ href }: { href: string }) {
  const pathname = usePathname();
  const aboveBuyBar = pathname.startsWith("/product/");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed right-4 z-30 flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-colors hover:animate-none hover:bg-[#1ebe5a] focus-visible:animate-none motion-reduce:animate-none sm:right-6 lg:bottom-6",
        aboveBuyBar ? "bottom-24" : "bottom-5",
      )}
    >
      <WhatsappLogo size={30} weight="fill" aria-hidden="true" />
    </a>
  );
}
