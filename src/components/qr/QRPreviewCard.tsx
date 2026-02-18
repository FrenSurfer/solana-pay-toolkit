"use client";

import type { HistoryItem } from "@/types/solana-pay";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

interface QRPreviewCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
  onDownload: (item: HistoryItem) => void;
}

export function QRPreviewCard({
  item,
  onDelete,
  onDownload,
}: QRPreviewCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-muted p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.qrDataUrl}
          alt={item.label || "QR Code"}
          className="size-full object-contain p-4"
        />
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h4 className="truncate font-medium">{item.label || "Untitled"}</h4>
          <p className="text-muted-foreground text-xs capitalize">
            {item.type} • {item.network}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </p>
        </div>

        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDownload(item)}
          >
            <Download size={14} className="mr-1 shrink-0" />
            Download
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
