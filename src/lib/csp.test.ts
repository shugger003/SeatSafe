import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/lib/csp";

describe("content security policy", () => {
  it("does not allow inline scripts in production", () => {
    const policy = contentSecurityPolicy("abc123", false);
    const scriptSrc = policy.split("; ").find((part) => part.startsWith("script-src "));
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(scriptSrc).not.toContain("unsafe-eval");
  });

  it("allows the dev debugger to use eval", () => {
    const scriptSrc = contentSecurityPolicy("abc123", true)
      .split("; ")
      .find((part) => part.startsWith("script-src "));
    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("unsafe-inline");
  });
});
