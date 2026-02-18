"use client";

import { useState } from "react";
import { SyntaxValidator } from "./SyntaxValidator";
import { useOnChainValidation } from "@/hooks/useOnChainValidation";
import type { ValidationResult } from "@/types/solana-pay";

type FullValidatorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function FullValidator({ value, onChange }: FullValidatorProps = {}) {
  const [validatedUrl, setValidatedUrl] = useState<string | null>(null);
  const { validate, result, loading, error } = useOnChainValidation();

  const handleSyntaxValid = (
    url: string,
    parsed: ValidationResult["parsed"]
  ) => {
    setValidatedUrl(url);
    if (parsed?.recipient) {
      validate(parsed.recipient, "devnet", parsed.token);
    }
  };

  return (
    <div className="space-y-8">
      <SyntaxValidator
        value={value}
        onChange={onChange}
        onValid={handleSyntaxValid}
      />

      {validatedUrl && (
        <div className="border-t border-border pt-6">
          <h3 className="mb-4 font-semibold">On-Chain Validation</h3>

          {loading && (
            <p className="text-muted-foreground text-sm">
              Checking blockchain...
            </p>
          )}

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {result && !loading && (
            <div
              className={`rounded-lg p-4 ${
                result.valid
                  ? "border border-green-800/50 bg-green-950/30 dark:bg-green-950/30"
                  : "border border-yellow-800/50 bg-yellow-950/20 dark:bg-yellow-950/20"
              }`}
            >
              <p className="font-medium">
                Account exists: {result.accountExists ? "Yes" : "No"}
              </p>
              {result.balance !== undefined && (
                <p className="text-sm">
                  Balance:{(Number(result.balance) / 1e9).toFixed(4)} SOL
                </p>
              )}
              {result.isExecutable && (
                <p className="text-destructive text-sm">
                  Warning: Account is executable (program)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
