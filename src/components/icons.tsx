import { Airplane } from "@phosphor-icons/react/dist/ssr/Airplane";
import { Bed } from "@phosphor-icons/react/dist/ssr/Bed";
import { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { ForkKnife } from "@phosphor-icons/react/dist/ssr/ForkKnife";
import { HandSoap } from "@phosphor-icons/react/dist/ssr/HandSoap";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { Leaf } from "@phosphor-icons/react/dist/ssr/Leaf";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { SprayBottle } from "@phosphor-icons/react/dist/ssr/SprayBottle";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Tote } from "@phosphor-icons/react/dist/ssr/Tote";
import { Truck } from "@phosphor-icons/react/dist/ssr/Truck";
import type { Icon } from "@phosphor-icons/react";
import type { IconKey } from "@/lib/types";

const ICONS: Record<IconKey, Icon> = {
  bottle: SprayBottle,
  hand: HandSoap,
  bag: Tote,
  home: House,
  clock: Clock,
  spark: Sparkle,
  leaf: Leaf,
  shield: ShieldCheck,
  truck: Truck,
  card: CreditCard,
  office: Buildings,
  hotel: Bed,
  dining: ForkKnife,
  travel: Airplane,
};

export function StoreIcon({ name, size = 22 }: { name: IconKey; size?: number }) {
  const Glyph = ICONS[name] ?? Sparkle;
  return <Glyph size={size} weight="regular" aria-hidden="true" />;
}
