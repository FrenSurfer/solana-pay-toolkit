"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const TOKENS = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
] as const;

export type TokenOption = (typeof TOKENS)[number];

interface AmountInputProps {
  value: string;
  onChange: (value: string, token: TokenOption) => void;
  className?: string;
}

export function AmountInput({ value, onChange, className }: AmountInputProps) {
  const [selectedToken, setSelectedToken] = useState<TokenOption>(TOKENS[0]);

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        type="number"
        step={10 ** -selectedToken.decimals}
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value, selectedToken)}
        placeholder="0.00"
        className="flex-1"
      />
      <Select
        value={selectedToken.symbol}
        onValueChange={(symbol) => {
          const token = TOKENS.find((t) => t.symbol === symbol) ?? TOKENS[0];
          setSelectedToken(token);
          onChange(value, token);
        }}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TOKENS.map((token) => (
            <SelectItem key={token.symbol} value={token.symbol}>
              {token.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
