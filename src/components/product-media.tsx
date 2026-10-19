import { cn } from "@/lib/cn";

export function ProductMedia({
  src,
  alt,
  logo,
  priority = false,
  tone = "stone",
  className,
}: {
  src?: string | null;
  alt: string;
  logo?: string;
  priority?: boolean;
  tone?: "stone" | "stage";
  className?: string;
}) {
  const stage = tone === "stage";
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center overflow-hidden",
          stage ? "aspect-[4/3] w-full max-w-full rounded-lg bg-pine lg:aspect-[4/5]" : "aspect-[4/3] max-h-[28rem] rounded-lg bg-pine",
          className,
        )}
      >
        {logo ? (
          <span className={cn("flex items-center justify-center rounded-full bg-white", stage ? "size-40 sm:size-52" : "size-28")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className="size-3/4 object-contain" />
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg bg-mist", className)}>
      {/* Uploaded media is served by the app and is not part of the static image pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aspect-[4/3] max-h-[28rem] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
