import { afterEach, describe, expect, it, vi } from "vitest";
import { paymentConfirmationSms, sendMoolreSms, smsNetworkForPhone, smsRecipient } from "@/lib/sms";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  delete process.env.MOOLRE_SMS_VASKEY;
  delete process.env.MOOLRE_SMS_SENDER_ID;
});

describe("sms recipient", () => {
  it("turns a local Ghana number into the Moolre form", () => {
    expect(smsRecipient("026 561 7666")).toBe("233265617666");
    expect(smsRecipient("not a phone")).toBe("");
  });
});

describe("payment confirmation", () => {
  it("names the order, the total, and the call number inside one text", () => {
    const message = paymentConfirmationSms({
      businessName: "ASAS SitSafe",
      orderNumber: "ORD-20261101-9646",
      total: "GH\u20b530.00",
      phone: "026 561 7666",
    });
    expect(message).toBe(
      "ASAS SitSafe: payment received for ORD-20261101-9646. Total GH\u20b530.00. We will deliver your order. Call 026 561 7666 with questions.",
    );
    expect(message.length).toBeLessThanOrEqual(160);
  });

  it("drops the call line when a long name would overflow one text", () => {
    const message = paymentConfirmationSms({
      businessName: "A".repeat(80),
      orderNumber: "ORD-20261101-9646",
      total: "GH\u20b530.00",
      phone: "026 561 7666",
    });
    expect(message.length).toBeLessThanOrEqual(160);
    expect(message).not.toContain("Call");
    expect(message).toContain("ORD-20261101-9646");
  });

  it("routes MTN and Telecel prefixes and leaves other networks unset", () => {
    expect(smsNetworkForPhone("0243646400")).toBe("MTN");
    expect(smsNetworkForPhone("0205551234")).toBe("TELECEL");
    expect(smsNetworkForPhone("0265617666")).toBe("");
  });
});

describe("send Moolre sms", () => {
  it("does not call Moolre when the VAS key is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await sendMoolreSms({ phone: "0265617666", message: "Hello" });
    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts one message with the VAS key and approved sender id", async () => {
    process.env.MOOLRE_SMS_VASKEY = "vas-test";
    process.env.MOOLRE_SMS_SENDER_ID = "SitSafe";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ status: 1, code: "SMS01", message: "Success" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await sendMoolreSms({ phone: "0265617666", message: "Your order is ready.", network: "mtn" });
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.moolre.com/open/sms/send");
    expect(init.headers).toMatchObject({ "X-API-VASKEY": "vas-test" });
    expect(JSON.parse(String(init.body))).toEqual({
      type: 1,
      senderid: "SitSafe",
      network: "MTN",
      messages: [{ recipient: "233265617666", message: "Your order is ready." }],
    });
  });

  it("returns Moolre\u2019s error when the sender id is not approved", async () => {
    process.env.MOOLRE_SMS_VASKEY = "vas-test";
    process.env.MOOLRE_SMS_SENDER_ID = "SitSafe";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ status: 0, code: "ASMS07", message: "Sender ID is not approved" }), { status: 400 })),
    );
    const result = await sendMoolreSms({ phone: "0265617666", message: "Hello" });
    expect(result).toEqual({ ok: false, message: "Sender ID is not approved" });
  });
});
