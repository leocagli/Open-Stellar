import { describe, expect, it, beforeEach } from "vitest";
import {
  createServiceApiKey,
  resetApiKeyStore,
  validateApiKey,
} from "@/lib/auth/api-keys";

function request(key?: string): Request {
  return new Request("https://openstellar.example/api/protocol/x402/quote", {
    headers: key ? { authorization: `Bearer ${key}` } : {},
  });
}

describe("api key management", () => {
  beforeEach(() => resetApiKeyStore());

  it("creates scoped service keys and validates matching scopes", async () => {
    const { key, record } = await createServiceApiKey({
      name: "integration",
      scopes: ["x402:quote"],
      expiresAt: "2027-01-01T00:00:00.000Z",
    });

    expect(key).toMatch(/^osk_live_/);
    expect(record.id).toMatch(/^key_/);
    expect(record.keyHash).not.toContain(key);

    const validation = await validateApiKey(request(key), ["x402:quote"]);
    expect(validation.ok).toBe(true);
    expect(validation.record?.requestCount).toBe(1);
  });

  it("rejects service keys without the required scope", async () => {
    const { key } = await createServiceApiKey({
      name: "reader",
      scopes: ["agents:read"],
    });

    const validation = await validateApiKey(request(key), ["x402:settle"]);

    expect(validation.ok).toBe(false);
    expect(validation.error).toBe("insufficient_scope");
  });
});
