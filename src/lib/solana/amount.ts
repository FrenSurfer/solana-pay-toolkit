import BigNumber from "bignumber.js";

const DEFAULT_MAX_DECIMALS = 9;

export function validateAmount(
  amount: string,
  min?: string,
  maxDecimals: number = DEFAULT_MAX_DECIMALS
): {
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
    if (min !== undefined) {
      const minBn = new BigNumber(min);
      if (bn.lt(minBn))
        return {
          valid: false,
          error: `Minimum amount is ${min}`,
        };
    }
    if ((bn.decimalPlaces() ?? 0) > maxDecimals) {
      return {
        valid: false,
        error:
          maxDecimals === 2
            ? "Maximum 2 decimal places"
            : `Too many decimal places (max ${maxDecimals})`,
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid amount format" };
  }
}
