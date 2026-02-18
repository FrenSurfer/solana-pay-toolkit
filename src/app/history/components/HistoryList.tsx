"use client";

import { useEffect } from "react";
import { useHistoryStore } from "@/stores/historyStore";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function HistoryList() {
  const { loadItems, deleteItem, filteredItems, loading } = useHistoryStore();
  const items = filteredItems();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Loading history...</p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No QR codes generated yet
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-lg border border-border p-4"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.qrDataUrl}
              alt="QR Code"
              className="size-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <p className="truncate font-medium">
              {item.label || "Untitled"}
            </p>
            <p className="text-muted-foreground text-xs capitalize">
              {item.type}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </p>
          </div>

          <div className="mt-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const a = document.createElement("a");
                a.href = item.qrDataUrl;
                a.download = `solana-pay-qr-${item.id}.png`;
                a.click();
              }}
            >
              Download
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteItem(item.id)}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
