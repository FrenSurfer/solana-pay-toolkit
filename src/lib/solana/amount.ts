import BigNumber from "bignumber.js";

export function validateAmount(amount: string): {
  valid: boolean;
  error?: string;
} {
  if (!amount) return { valid: false, error: "Amount is required" };
  try {
    const bn = new BigNumber(amount);
    if (bn.isNaN()) return { valid: false, error: "Invalid number" };
    if (bn.isNegative())
      return { valid: false, error: "Amount must be positive" };
    if (bn.isZero())
      return { valid: false, error: "Amount must be greater than 0" };
    if ((bn.decimalPlaces() ?? 0) > 9) {
      return {
        valid: false,
        error: "Too many decimal places (max 9)",
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid amount format" };
  }
}

export function lamportsToSol(lamports: number): string {
  return new BigNumber(lamports).dividedBy(1e9).toString();
}

export function solToLamports(sol: string): number {
  return new BigNumber(sol).multipliedBy(1e9).toNumber();
}
