import { afterEach, describe, expect, it, vi } from "vitest";
import { paymentsMode, verifyMoolreSecret } from "@/lib/moolre";

const KEYS = ["PAYMENTS_MODE", "MOOLRE_API_USER", "MOOLRE_API_PUBKEY", "MOOLRE_ACCOUNT_NUMBER", "MOOLRE_WEBHOOK_SECRET"] as const;

afterEach(() => {
  vi.unstubAllEnvs();
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
  it("stays off while the previous Moolre merchant is disconnected", () => {
    expect(paymentsMode()).toBe("disabled");
    process.env.MOOLRE_API_USER = "merchant";
    process.env.MOOLRE_API_PUBKEY = "pub";
    process.env.MOOLRE_ACCOUNT_NUMBER = "123";
    process.env.MOOLRE_WEBHOOK_SECRET = "secret";
    expect(paymentsMode()).toBe("disabled");
  });

  it("keeps the test simulator off in production", () => {
    process.env.PAYMENTS_MODE = "test";
    vi.stubEnv("NODE_ENV", "production");
    expect(paymentsMode()).toBe("disabled");
  });
});
