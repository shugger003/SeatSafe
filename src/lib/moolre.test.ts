import { afterEach, describe, expect, it } from "vitest";
import { paymentsMode, verifyMoolreSecret } from "@/lib/moolre";

const KEYS = ["PAYMENTS_MODE", "MOOLRE_API_USER", "MOOLRE_API_PUBKEY", "MOOLRE_ACCOUNT_NUMBER", "MOOLRE_WEBHOOK_SECRET", "NODE_ENV"] as const;

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe("moolre callback secret", () => {
  it("accepts the matching secret and rejects a different one", () => {
    process.env.MOOLRE_WEBHOOK_SECRET = "callback-secret";
    expect(verifyMoolreSecret("callback-secret")).toBe(true);
    expect(verifyMoolreSecret("callback-secreT")).toBe(false);
    expect(verifyMoolreSecret("short")).toBe(false);
    expect(verifyMoolreSecret(null)).toBe(false);
  });
});

describe("payments mode", () => {
  it("is live only when every Moolre value is set", () => {
    expect(paymentsMode()).toBe("disabled");
    process.env.MOOLRE_API_USER = "merchant";
    process.env.MOOLRE_API_PUBKEY = "pub";
    process.env.MOOLRE_ACCOUNT_NUMBER = "123";
    expect(paymentsMode()).toBe("disabled");
    process.env.MOOLRE_WEBHOOK_SECRET = "secret";
    expect(paymentsMode()).toBe("live");
  });

  it("keeps the test simulator off in production", () => {
    process.env.PAYMENTS_MODE = "test";
    process.env.NODE_ENV = "production";
    expect(paymentsMode()).toBe("disabled");
  });
});
