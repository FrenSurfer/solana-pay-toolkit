export const SOLANA_ERROR_MESSAGES: Record<string, string> = {
  "PublicKey is invalid": "Invalid Solana address format",
  "insufficient funds": "Insufficient balance for this transaction",
  "blockhash not found": "Network error, please retry",
  timeout: "Request timeout, check your connection",
  "failed to get recent blockhash": "RPC connection failed",
  "Transaction simulation failed": "Transaction would fail",
  "Account not found": "Account does not exist on this network",
  "Invalid param: could not find account": "Account not found",
};

export function getUserErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    return SOLANA_ERROR_MESSAGES[message] ?? message;
  }
  return "An unexpected error occurred";
}
