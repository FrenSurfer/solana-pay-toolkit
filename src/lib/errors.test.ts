import { describe, it, expect } from "vitest";
import { getUserErrorMessage, SOLANA_ERROR_MESSAGES } from "./errors";

describe("getUserErrorMessage", () => {
  it("maps known Solana errors to user messages", () => {
    expect(
      getUserErrorMessage(new Error("PublicKey is invalid"))
    ).toBe("Invalid Solana address format");
    expect(
      getUserErrorMessage(new Error("insufficient funds"))
    ).toBe("Insufficient balance for this transaction");
  });

  it("returns original message for unknown errors", () => {
    expect(getUserErrorMessage(new Error("Custom error"))).toBe("Custom error");
  });

  it("returns fallback for non-Error values", () => {
    expect(getUserErrorMessage("string")).toBe("An unexpected error occurred");
    expect(getUserErrorMessage(null)).toBe("An unexpected error occurred");
  });
});

describe("SOLANA_ERROR_MESSAGES", () => {
  it("has expected keys", () => {
    expect(SOLANA_ERROR_MESSAGES["PublicKey is invalid"]).toBeDefined();
    expect(SOLANA_ERROR_MESSAGES["Account not found"]).toBeDefined();
  });
});
