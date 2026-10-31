import { describe, expect, it } from "vitest";
import { inquiryBody, inquiryTopic, partnershipMessage } from "@/lib/partnerships";

const person = { name: "Ama Mensah", phone: "026 561 7666" };

describe("partnership requests", () => {
  it("writes a bulk request without inventing a price", () => {
    const result = partnershipMessage({
      kind: "bulk",
      ...person,
      organisation: "Ridge Hotel",
      quantity: "40",
      place: "Greater Accra",
      channel: "",
      selling: "",
      note: "Need them before a conference.",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(
      ["Request: Bulk buying", "Organisation: Ridge Hotel", "Bottles: 40", "Deliver to: Greater Accra", "", "Need them before a conference."].join("\n"),
    );
    expect(result.message.toLowerCase()).not.toContain("discount");
  });

  it("rejects a single bottle as a bulk order", () => {
    const result = partnershipMessage({ kind: "bulk", ...person, organisation: "", quantity: "1", place: "Accra", channel: "", selling: "", note: "" });
    expect(result).toEqual({ ok: false, message: "Enter how many bottles you need, from 2 to 10,000." });
  });

  it("requires a place an affiliate would share SitSafe", () => {
    const missing = partnershipMessage({ kind: "affiliate", ...person, organisation: "", quantity: "", place: "", channel: "", selling: "", note: "" });
    expect(missing.ok).toBe(false);
    const result = partnershipMessage({
      kind: "affiliate",
      ...person,
      organisation: "",
      quantity: "",
      place: "",
      channel: "Instagram",
      selling: "",
      note: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(inquiryTopic(result.message)).toBe("Affiliate");
  });

  it("requires a business, a region, and how a distributor would sell", () => {
    const result = partnershipMessage({
      kind: "distributor",
      ...person,
      organisation: "Ama Stores",
      quantity: "",
      place: "Ashanti",
      channel: "",
      selling: "A shop and delivery",
      note: "",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(inquiryBody(result.message)).toContain("Region: Ashanti");
    expect(inquiryTopic("Hello from the contact form")).toBe("");
  });
});
