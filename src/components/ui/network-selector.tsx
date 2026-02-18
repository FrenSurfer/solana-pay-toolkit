"use client";

import type { Network } from "@/types/solana-pay";
import { cn } from "@/lib/utils";

interface NetworkSelectorProps {
  value: Network;
  onChange: (network: Network) => void;
  className?: string;
}

const NETWORKS: { value: Network; label: string; color: string }[] = [
  { value: "devnet", label: "Devnet", color: "bg-purple-500" },
  { value: "mainnet", label: "Mainnet", color: "bg-green-500" },
];

export function NetworkSelector({
  value,
  onChange,
  className,
}: NetworkSelectorProps) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg bg-muted p-1",
        className
      )}
    >
      {NETWORKS.map((network) => (
        <button
          key={network.value}
          type="button"
          onClick={() => onChange(network.value)}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
            value === network.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span
            className={cn("size-2 rounded-full", network.color)}
          />
          {network.label}
        </button>
      ))}
    </div>
  );
}
