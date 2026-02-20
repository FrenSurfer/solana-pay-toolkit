"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download, Share2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkParams } from "@/types/solana-pay";

interface QRDisplayProps {
  qrBase64: string;
  url: string;
  reference?: string;
  linkParams?: LinkParams | null;
  className?: string;
}

export function QRDisplay({
  qrBase64,
  url,
  reference,
  linkParams,
  className,
}: QRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrBase64}`;
    link.download = `solana-pay-${reference ?? "qr"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        const blob = await fetch(
          `data:image/png;base64,${qrBase64}`
        ).then((r) => r.blob());
        const file = new File([blob], "solana-pay-qr.png", {
          type: "image/png",
        });
        await navigator.share({
          title: "Solana Pay QR",
          text: url,
          files: [file],
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const handleGetPaymentLink = async () => {
    if (!linkParams) return;
    setLinkLoading(true);
    setLinkCopied(false);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: linkParams.recipient,
          amount: linkParams.amount,
          token: linkParams.token,
          splToken: linkParams.splToken ?? undefined,
          label: linkParams.label ?? "Payment",
          message: linkParams.message ?? undefined,
          memo: linkParams.memo ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create link");
      const { url: payUrl } = await res.json();
      await navigator.clipboard.writeText(payUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
      toast.success("Payment link copied to clipboard!", {
        description: payUrl,
        duration: 3000,
      });
    } catch {
      setLinkCopied(false);
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-square rounded-xl border-2 border-solana-purple/20 bg-background p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt="Solana Pay QR Code"
          className="size-full object-contain p-4"
        />
      </div>

      <div className="space-y-2">
        <p className="break-all font-mono text-muted-foreground text-xs">
          {url}
        </p>

        <div className="flex flex-wrap gap-2">
          {linkParams && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[140px]"
              onClick={handleGetPaymentLink}
              disabled={linkLoading}
            >
              {linkCopied ? (
                <Check size={16} className="mr-1.5 shrink-0" />
              ) : (
                <Link2 size={16} className="mr-1.5 shrink-0" />
              )}
              {linkLoading ? "..." : linkCopied ? "Link copied!" : "Get payment link"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={16} className="mr-1.5 shrink-0" />
            ) : (
              <Copy size={16} className="mr-1.5 shrink-0" />
            )}
            {copied ? "Copied" : "Copy URL"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download size={16} className="mr-1.5 shrink-0" />
            Download
          </Button>

          {typeof navigator.share === "function" && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {reference && (
        <div className="text-center text-muted-foreground text-xs">
          Reference: {reference.slice(0, 8)}...{reference.slice(-8)}
        </div>
      )}
    </div>
  );
}
