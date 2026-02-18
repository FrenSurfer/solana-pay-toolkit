"use client";

import { useState, useCallback } from "react";
import type { OnChainValidation, Network } from "@/types/solana-pay";

export function useOnChainValidation() {
  const [result, setResult] = useState<OnChainValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (
      recipient: string,
      network: Network = "devnet",
      tokenMint?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient, network, tokenMint }),
        });

        if (!response.ok) throw new Error("Validation failed");

        const data = await response.json();
        setResult(data);
        return data as OnChainValidation;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { validate, result, loading, error };
}
