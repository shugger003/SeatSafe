import Image from "next/image";
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
  const frame = cn(
    "relative overflow-hidden",
    stage ? "aspect-[4/3] w-full max-w-full rounded-lg bg-pine lg:aspect-[4/5]" : "aspect-[4/3] max-h-[28rem] rounded-lg bg-pine",
    className,
  );
  const sizes = stage ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw";

  if (!src) {
    return (
      <div role="img" aria-label={alt} className={cn(frame, "flex items-center justify-center")}>
        {logo ? (
          <span className={cn("relative flex items-center justify-center overflow-hidden rounded-full bg-white", stage ? "size-40 sm:size-52" : "size-28")}>
            <Image src={logo} alt="" fill sizes="160px" className="object-contain p-[12%]" />
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(frame, "bg-mist")}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("/")}
        className="object-cover"
      />
    </div>
  );
}
