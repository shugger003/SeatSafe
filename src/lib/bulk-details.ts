export type BulkDetails = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  place: string;
  note: string;
};

const KEY = "seat-bulk-details";

export function saveBulkDetails(details: BulkDetails) {
  sessionStorage.setItem(KEY, JSON.stringify(details));
}

export function readBulkDetails(): BulkDetails | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BulkDetails>;
    if (!parsed || typeof parsed.name !== "string" || typeof parsed.email !== "string") return null;
    return {
      name: parsed.name.slice(0, 120),
      email: parsed.email.slice(0, 160),
      phone: String(parsed.phone || "").slice(0, 40),
      organisation: String(parsed.organisation || "").slice(0, 160),
      place: String(parsed.place || "").slice(0, 200),
      note: String(parsed.note || "").slice(0, 300),
    };
  } catch {
    return null;
  }
}

export function clearBulkDetails() {
  sessionStorage.removeItem(KEY);
}

export function bulkInstructions(details: Pick<BulkDetails, "organisation" | "note">) {
  return [details.organisation.trim() ? `Organisation: ${details.organisation.trim()}` : "", details.note.trim()]
    .filter(Boolean)
    .join("\n")
    .slice(0, 300);
}
