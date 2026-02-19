"use client";

import { useState, useEffect } from "react";
import type { HistoryItem } from "@/types/solana-pay";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, Download, ChevronDown, ChevronUp, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";

function isTransferParams(
  p: HistoryItem["params"]
): p is HistoryItem["params"] & {
  recipient?: string;
  amount?: string;
  splToken?: string;
  tokenSymbol?: string;
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

function truncate(str: string, len: number): string {
  return str.length > len ? `${str.slice(0, len)}...` : str;
}

/** Token-based color for amount display */
function amountColorClass(tokenSymbol: string): string {
  switch (tokenSymbol?.toUpperCase()) {
    case "SOL":
      return "text-solana-purple";
    case "USDC":
      return "text-green-600 dark:text-green-400";
    case "USDT":
      return "text-emerald-600 dark:text-emerald-400";
    case "BONK":
      return "text-amber-600 dark:text-amber-400";
    case "JUP":
      return "text-sky-600 dark:text-sky-400";
    default:
      return "text-foreground";
  }
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
  const [showUrl, setShowUrl] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const params = item.params;

  // Transition fluide à l’ouverture (GPU: transform + opacity)
  useEffect(() => {
    if (isZoomed) {
      const id = requestAnimationFrame(() => setZoomVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setZoomVisible(false);
  }, [isZoomed]);

  const copyRef = (ref: string) => {
    void navigator.clipboard.writeText(ref).then(() => {
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    });
  };

  const formatAmount = (): { text: string; tokenSymbol: string } | null => {
    if (!isTransferParams(params) || !params.amount) return null;
    const tokenSymbol =
      ("tokenSymbol" in params && params.tokenSymbol) ||
      (params.splToken ? "SPL" : "SOL");
    return { text: `${params.amount} ${tokenSymbol}`, tokenSymbol };
  };

  const amountInfo = formatAmount();
  const typeLabel =
    item.type === "transactionRequest"
      ? "Transaction Request"
      : item.type.charAt(0).toUpperCase() + item.type.slice(1);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
        {/* QR Image – grisé, clic = zoom */}
        <div
          className="group relative aspect-square cursor-pointer bg-muted p-4"
          onClick={() => setIsZoomed(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setIsZoomed(true)}
          aria-label="Zoom QR code"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.qrDataUrl}
            alt={item.label || "QR Code"}
            className="size-full object-contain p-4 brightness-[0.65] contrast-[0.8] transition-all duration-300 group-hover:brightness-100 group-hover:contrast-100"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
              Click to zoom
            </span>
          </div>
        </div>

      {/* Main info – always visible */}
      <div className="space-y-2 p-4">
        <h4 className="truncate text-lg font-semibold">
          {item.label || "Untitled"}
        </h4>

        {/* Amount – prominent, with token color */}
        {amountInfo && (
          <p
            className={cn(
              "text-2xl font-bold",
              amountColorClass(amountInfo.tokenSymbol)
            )}
          >
            {amountInfo.text}
          </p>
        )}

        {/* Reference – if present, with copy */}
        {isTransferParams(params) && params.reference && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground shrink-0">Ref:</span>
            <span
              className="rounded bg-muted px-2 py-0.5 font-mono text-xs"
              title={params.reference}
            >
              {truncate(params.reference, 16)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => copyRef(params.reference!)}
              aria-label="Copy reference"
            >
              {refCopied ? (
                <span className="text-xs text-green-600">Copied!</span>
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </div>
        )}

        {/* Memo – if present */}
        {isTransferParams(params) && params.memo && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Memo:</span>
            <span className="max-w-[200px] truncate text-sm">
              {params.memo}
            </span>
          </div>
        )}

        {/* Message – if present and no memo (transfer); or for message type */}
        {item.type === "message" && "message" in params && params.message && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {params.message}
          </p>
        )}
        {isTransferParams(params) &&
          params.message &&
          !params.memo && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {params.message}
            </p>
          )}

        {/* Transaction request: link preview */}
        {isTransactionRequestParams(params) && params.link && (
          <p className="line-clamp-1 break-all text-xs text-muted-foreground">
            {truncate(params.link, 32)}
          </p>
        )}

        {/* Meta: type • date */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-2 py-0.5">{typeLabel}</span>
          <span aria-hidden>•</span>
          <span>
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setShowUrl(!showUrl)}
          >
            {showUrl ? (
              <ChevronUp size={14} className="mr-1 shrink-0" />
            ) : (
              <ChevronDown size={14} className="mr-1 shrink-0" />
            )}
            {showUrl ? "Hide URL" : "Details"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(item)}
            aria-label="Download"
          >
            <Download size={14} />
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

        {/* Expanded: full URL and extra details */}
        {showUrl && (
          <div className="space-y-2 border-t border-border pt-2 text-sm">
            <p
              className="break-all rounded bg-muted p-2 font-mono text-xs text-muted-foreground"
              title={item.url}
            >
              {item.url}
            </p>
            {isTransferParams(params) && params.recipient && (
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-muted-foreground">To:</span>
                <span className="truncate font-mono" title={params.recipient}>
                  {params.recipient.slice(0, 8)}...{params.recipient.slice(-8)}
                </span>
              </div>
            )}
            {isTransferParams(params) && params.message && (
              <div>
                <span className="text-muted-foreground text-xs">Message:</span>
                <p className="bg-muted mt-1 rounded p-2 text-xs">
                  {params.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Modal zoom */}
      {isZoomed && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-150 ease-out",
            zoomVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="QR code zoomed"
        >
          <div
            className={cn(
              "relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl transition-[transform,opacity] duration-150 ease-out will-change-transform",
              zoomVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white transition-colors hover:text-white/80"
              aria-label="Close"
            >
              <X size={32} />
            </button>

            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.qrDataUrl}
                alt={item.label || "QR Code"}
                className="size-full object-contain"
              />
            </div>

            <div className="mt-6 space-y-2 text-center">
              <p className="text-lg font-semibold">{item.label || "Untitled"}</p>
              {amountInfo && (
                <p
                  className={cn(
                    "text-3xl font-bold",
                    amountColorClass(amountInfo.tokenSymbol)
                  )}
                >
                  {amountInfo.text}
                </p>
              )}
              <p
                className="break-all font-mono text-sm text-muted-foreground"
                title={item.url}
              >
                {truncate(item.url, 60)}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  onDownload(item);
                  setIsZoomed(false);
                }}
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsZoomed(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
