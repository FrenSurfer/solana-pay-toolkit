"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const QUICK_TOKENS = [
  { symbol: "SOL", mint: null, decimals: 9, icon: "◎" },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    icon: "$",
  },
] as const;

const OTHER_TOKENS = [
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
  {
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
  },
  {
    symbol: "JUP",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
  },
] as const;

export interface TokenOption {
  symbol: string;
  mint: string | null;
  decimals: number;
}

interface TokenSelectorProps {
  value: TokenOption;
  onChange: (token: TokenOption) => void;
  className?: string;
}

export function TokenSelector({
  value,
  onChange,
  className,
}: TokenSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customMint, setCustomMint] = useState("");

  return (
    <div className={cn("space-y-2", className)}>
      {/* Quick toggle SOL / USDC */}
      <div className="flex cursor-pointer rounded-lg bg-muted p-1">
        {QUICK_TOKENS.map((token) => (
          <button
            key={token.symbol}
            type="button"
            onClick={() => onChange({ ...token })}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              value.symbol === token.symbol && value.mint === token.mint
                ? "bg-background text-solana-purple shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{token.icon}</span>
            {token.symbol}
          </button>
        ))}
      </div>

      {/* Advanced: other tokens */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-solana-purple"
      >
        {showAdvanced ? (
          <ChevronUp size={14} aria-hidden />
        ) : (
          <ChevronDown size={14} aria-hidden />
        )}
        Advanced (other tokens)
      </button>

      {showAdvanced && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-3">
          <div className="space-y-2">
            <Label htmlFor="custom-mint" className="text-xs">
              Custom Token Mint
            </Label>
            <Input
              id="custom-mint"
              type="text"
              placeholder="Enter SPL token mint address..."
              value={customMint}
              onChange={(e) => setCustomMint(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (customMint.trim().length >= 32) {
                  onChange({
                    symbol: "CUSTOM",
                    mint: customMint.trim(),
                    decimals: 6,
                  });
                }
              }}
              disabled={customMint.trim().length < 32}
            >
              Use Custom Token
            </Button>
          </div>

          <div className="border-t border-border pt-2">
            <p className="text-muted-foreground mb-2 text-xs">
              Or select common token:
            </p>
            <div className="flex flex-wrap gap-2">
              {OTHER_TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() =>
                    onChange({
                      symbol: token.symbol,
                      mint: token.mint,
                      decimals: token.decimals,
                    })
                  }
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                    value.symbol === token.symbol && value.mint === token.mint
                      ? "border-solana-purple bg-solana-purple text-white"
                      : "border-border bg-background text-muted-foreground hover:border-solana-purple hover:text-foreground"
                  )}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>

          {value.symbol !== "SOL" && value.symbol !== "USDC" && value.mint && (
            <div className="flex flex-wrap items-center gap-2 rounded bg-solana-purple/10 px-2 py-2 text-xs text-solana-purple">
              <span>
                Selected: <strong>{value.symbol}</strong>
              </span>
              <span
                className="max-w-[150px] truncate font-mono"
                title={value.mint}
              >
                {value.mint}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
