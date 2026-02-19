"use client";

import { useState } from "react";
import type { HistoryItem } from "@/types/solana-pay";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Download, ChevronDown, ChevronUp } from "lucide-react";

function isTransferParams(
  p: HistoryItem["params"]
): p is HistoryItem["params"] & {
  recipient?: string;
  amount?: string;
  splToken?: string;
  reference?: string;
  message?: string;
  memo?: string;
} {
  return "recipient" in p;
}

function isTransactionRequestParams(
  p: HistoryItem["params"]
): p is HistoryItem["params"] & { link?: string; message?: string } {
  return "link" in p;
}

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
  const [expanded, setExpanded] = useState(false);
  const params = item.params;

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
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="rounded bg-muted px-2 py-0.5">
              {item.type === "transactionRequest"
                ? "Transaction Request"
                : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
            <span>
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          {expanded ? (
            <ChevronUp size={14} aria-hidden />
          ) : (
            <ChevronDown size={14} aria-hidden />
          )}
          {expanded ? "Less details" : "More details"}
        </button>

        {expanded && (
          <div className="space-y-2 border-t border-border pt-2 text-sm">
            {isTransferParams(params) && (
              <>
                {params.recipient && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">To:</span>
                    <span className="truncate font-mono text-xs" title={params.recipient}>
                      {params.recipient.slice(0, 8)}...{params.recipient.slice(-8)}
                    </span>
                  </div>
                )}
                {params.amount && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>
                      {params.amount} {params.splToken ? "SPL" : "SOL"}
                    </span>
                  </div>
                )}
                {params.message && (
                  <div>
                    <span className="text-muted-foreground">Message:</span>
                    <p className="bg-muted mt-1 rounded p-2 text-xs">
                      {params.message}
                    </p>
                  </div>
                )}
                {params.reference && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Ref:</span>
                    <span className="truncate font-mono text-xs" title={params.reference}>
                      {params.reference.length > 12
                        ? `${params.reference.slice(0, 12)}...`
                        : params.reference}
                    </span>
                  </div>
                )}
                {params.memo && (
                  <div>
                    <span className="text-muted-foreground">Memo:</span>
                    <p className="text-muted-foreground text-xs">{params.memo}</p>
                  </div>
                )}
              </>
            )}
            {isTransactionRequestParams(params) && (
              <>
                {params.link && (
                  <div>
                    <span className="text-muted-foreground">Link:</span>
                    <p className="break-all text-xs">{params.link}</p>
                  </div>
                )}
                {params.message && (
                  <div>
                    <span className="text-muted-foreground">Message:</span>
                    <p className="bg-muted mt-1 rounded p-2 text-xs">
                      {params.message}
                    </p>
                  </div>
                )}
              </>
            )}
            {item.type === "message" && "message" in params && (
              <div>
                <span className="text-muted-foreground">Message:</span>
                <p className="bg-muted mt-1 rounded p-2 text-xs">
                  {params.message}
                </p>
              </div>
            )}
            <div className="pt-2">
              <p className="text-muted-foreground break-all text-xs" title={item.url}>
                {item.url}
              </p>
            </div>
          </div>
        )}

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
