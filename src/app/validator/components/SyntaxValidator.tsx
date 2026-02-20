"use client";

import { useState, useCallback } from "react";
import { validateURLSyntax } from "@/lib/solana/validation-engine";
import type { ValidationResult } from "@/types/solana-pay";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Copy } from "lucide-react";

type SyntaxValidatorProps = {
  value?: string;
  onChange?: (value: string) => void;
  onValid?: (url: string, parsed: ValidationResult["parsed"]) => void;
};

export function SyntaxValidator({
  value,
  onChange,
  onValid,
}: SyntaxValidatorProps = {}) {
  const [internalInput, setInternalInput] = useState("");
  const input = value ?? internalInput;
  const setInput = onChange ?? setInternalInput;
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const copyRecipient = useCallback((address: string) => {
    void navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleValidate = useCallback(() => {
    const validation = validateURLSyntax(input.trim());
    setResult(validation);
    if (validation.valid && validation.parsed && onValid) {
      onValid(input.trim(), validation.parsed);
    }
  }, [input, onValid]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Solana Pay URL or QR Content
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="solana:HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH?amount=0.5"
          rows={3}
        />
      </div>

      <Button onClick={handleValidate} className="w-full">
        Validate Syntax
      </Button>

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.valid
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            {result.valid ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            <span className="font-semibold">
              {result.valid ? "Valid Syntax" : "Invalid Syntax"}
            </span>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Errors:
              </p>
              <ul className="list-disc pl-4 text-sm text-red-600 dark:text-red-300">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    {e.field}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="flex items-center gap-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                <AlertTriangle size={14} /> Warnings:
              </p>
              <ul className="list-disc pl-4 text-sm text-yellow-600 dark:text-yellow-300">
                {result.warnings.map((w, i) => (
                  <li key={i}>
                    {w.field}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.parsed && Object.keys(result.parsed).length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              {result.parsed.recipient && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium">Recipient address</p>
                  <div className="flex flex-wrap items-start gap-2 rounded-md bg-muted/50 p-3">
                    <code className="min-w-0 flex-1 break-all font-mono text-xs">
                      {result.parsed.recipient}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => copyRecipient(result.parsed!.recipient!)}
                      aria-label="Copy address"
                    >
                      {copied ? (
                        <span className="text-xs text-green-600">Copied!</span>
                      ) : (
                        <Copy size={14} className="mr-1.5 shrink-0" />
                      )}
                      {copied ? "" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              <p className="mb-2 text-sm font-medium">Parsed Values:</p>
              <dl className="space-y-1 text-sm">
                {Object.entries(result.parsed).map(
                  ([key, value]) =>
                    value != null &&
                    value !== "" &&
                    key !== "recipient" && (
                      <div key={key} className="flex justify-between gap-2">
                        <dt className="text-muted-foreground shrink-0">{key}:</dt>
                        <dd className="max-w-[200px] truncate font-mono text-xs">
                          {String(value)}
                        </dd>
                      </div>
                    )
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
