"use client";

import { useEffect, useState } from "react";
import type { PaymentLink, PaymentStatus } from "@/lib/payment-links";
import QRCode from "qrcode";

function calculateTimeLeft(expiresAt: number): number {
  return Math.max(0, expiresAt - Date.now());
}

function formatTimeLeft(msLeft: number): string {
  if (msLeft <= 0) return "Expired";
  const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days >= 1) return `Expires in ${days} day${days > 1 ? "s" : ""}`;
  if (hours >= 1) return `Expires in ${hours} hour${hours > 1 ? "s" : ""}`;
  const minutes = Math.floor(msLeft / (60 * 1000));
  return minutes >= 1 ? `Expires in ${minutes} min` : "Expires soon";
}

interface PaymentCardProps {
  link: PaymentLink;
}

export function PaymentCard({ link }: PaymentCardProps) {
  const [status, setStatus] = useState<PaymentStatus>(link.status);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLargeDataUrl, setQrLargeDataUrl] = useState<string>("");
  const [showQrEnlarged, setShowQrEnlarged] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(link.expiresAt)
  );

  // Generate QR on the client (small + large for modal)
  useEffect(() => {
    const solanaUrl = `solana:${link.recipient}?amount=${link.amount}&reference=${link.reference}${link.splToken ? `&spl-token=${link.splToken}` : ""}`;
    QRCode.toDataURL(solanaUrl, { width: 200 }).then(setQrDataUrl);
    QRCode.toDataURL(solanaUrl, { width: 400 }).then(setQrLargeDataUrl);
  }, [link]);

  // Expiration: check every minute (no on-chain check, link just expires after 7 days)
  useEffect(() => {
    const tick = () => {
      const left = calculateTimeLeft(link.expiresAt);
      setTimeLeft(left);
      if (left <= 0 && status === "pending") {
        setStatus("expired");
      }
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [link.expiresAt, status]);

  const solanaPayUrl = `solana:${link.recipient}?amount=${link.amount}&reference=${link.reference}${link.splToken ? `&spl-token=${link.splToken}` : ""}`;
  const isExpired = status === "expired" || timeLeft <= 0;

  return (
    <>
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <div className="bg-solana-purple px-6 py-4 text-center text-white">
        <p className="text-sm font-medium opacity-95">
          Scan with your wallet · Mobile
        </p>
      </div>

      <div className="p-8">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground mb-2 text-sm">Amount to pay</p>
          <p className="text-foreground text-5xl font-bold">
            {link.amount}{" "}
            <span className="text-2xl text-solana-purple">{link.token}</span>
          </p>
        </div>

        {(link.reference || link.message || link.memo) && (
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Details
            </p>
            <dl className="space-y-2 text-sm">
              {link.reference && (
                <div>
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="mt-0.5 font-mono break-all">
                    {link.reference}
                  </dd>
                </div>
              )}
              {link.message && (
                <div>
                  <dt className="text-muted-foreground">Message</dt>
                  <dd className="mt-0.5">{link.message}</dd>
                </div>
              )}
              {link.memo && (
                <div>
                  <dt className="text-muted-foreground">Memo</dt>
                  <dd className="mt-0.5">{link.memo}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {!isExpired && (
          <div className="space-y-4">
            <a
              href={solanaPayUrl}
              className="flex w-full items-center justify-center rounded-xl bg-solana-purple py-4 font-semibold text-white transition hover:opacity-90"
            >
              Pay with Phantom
            </a>
            <div className="text-center">
              <p className="text-muted-foreground mb-3 text-sm">
                Scan this QR with Phantom (or another Solana wallet) on your
                phone
              </p>
              {qrDataUrl && (
                <button
                  type="button"
                  onClick={() => setShowQrEnlarged(true)}
                  className="mx-auto block cursor-pointer rounded-lg ring-2 ring-transparent transition hover:ring-solana-purple/50 focus:outline-none focus:ring-2 focus:ring-solana-purple"
                  aria-label="Enlarge QR code"
                >
                  <img
                    src={qrDataUrl}
                    alt="Payment QR"
                    className="mx-auto size-48 rounded-lg"
                  />
                </button>
              )}
              <p className="text-muted-foreground mt-2 text-xs">
                Tap to enlarge for easier scan
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="py-6 text-center">
            <div className="bg-red-100 dark:bg-red-950/50 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
              <svg
                className="text-red-600 dark:text-red-400 size-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              Link expired
            </h2>
            <p className="text-muted-foreground mt-2">
              This payment request is no longer valid
            </p>
          </div>
        )}
      </div>

      <div className="bg-muted/50 p-4 text-center text-muted-foreground text-xs">
        {!isExpired && timeLeft > 0 ? formatTimeLeft(timeLeft) : null}
        {!isExpired && timeLeft > 0 ? " · " : null}
        Powered by Solana Pay
      </div>
    </div>

    {showQrEnlarged && qrLargeDataUrl && (
      <button
        type="button"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 focus:outline-none"
        onClick={() => setShowQrEnlarged(false)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <img
          src={qrLargeDataUrl}
          alt="Payment QR (enlarged)"
          className="max-h-[85vh] max-w-full rounded-2xl bg-white p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        />
      </button>
    )}
    </>
  );
}
