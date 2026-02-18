import { describe, it, expect } from "vitest";
import { isValidPublicKey, validateRecipient } from "./validation";
import { validateAmount } from "./amount";

describe("isValidPublicKey", () => {
  it("validates correct Solana address", () => {
    const valid =
      "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH";
    expect(isValidPublicKey(valid)).toBe(true);
  });

  it("rejects invalid address", () => {
    expect(isValidPublicKey("invalid")).toBe(false);
    expect(isValidPublicKey("")).toBe(false);
    expect(isValidPublicKey("too-short")).toBe(false);
  });
});

describe("validateRecipient", () => {
  it("requires non-empty address", () => {
    const result = validateRecipient("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("rejects too short address", () => {
    const result = validateRecipient("short");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("short");
  });
});

describe("validateAmount", () => {
  it("accepts valid amounts", () => {
    expect(validateAmount("0.5").valid).toBe(true);
    expect(validateAmount("1").valid).toBe(true);
    expect(validateAmount("0.000000001").valid).toBe(true);
  });

  it("rejects invalid amounts", () => {
    expect(validateAmount("0").valid).toBe(false);
    expect(validateAmount("-1").valid).toBe(false);
    expect(validateAmount("abc").valid).toBe(false);
    expect(validateAmount("").valid).toBe(false);
  });
});
