import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";

export function WhatsAppBubble({ href, phone }: { href: string; phone?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="wa-fab group fixed right-4 z-30 flex items-center sm:right-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-4 hidden translate-x-2 whitespace-nowrap rounded-2xl bg-[#1c1f2b] px-5 py-3 text-left opacity-0 shadow-lg transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
      >
        <span className="block text-base font-semibold text-white">Chat on WhatsApp</span>
        {phone ? <span className="mt-0.5 block text-sm text-white/60">{phone}</span> : null}
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-y-[8px] border-l-[10px] border-y-transparent border-l-[#1c1f2b]" />
      </span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-colors group-hover:bg-[#1ebe5a] sm:h-14 sm:w-14">
        <WhatsappLogo size={28} weight="fill" aria-hidden="true" />
      </span>
    </a>
  );
}
