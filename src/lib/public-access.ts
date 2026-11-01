/** Public custom domains stay closed until 6:00 p.m. Ghana time on 1 November 2026. */
export const PUBLIC_CLOSED_UNTIL = Date.parse("2026-11-01T18:00:00.000Z");

/** Hosts that must not serve the store while it is closed. The Vercel address is not in this list. */
export const PUBLIC_CLOSED_HOSTS = new Set([
  "sitsafe.com",
  "www.sitsafe.com",
  "sitsafe.company",
  "www.sitsafe.company",
  "seatshieldghana.com",
  "www.seatshieldghana.com",
]);

export function publicSiteClosed(now = Date.now()) {
  return now < PUBLIC_CLOSED_UNTIL;
}
