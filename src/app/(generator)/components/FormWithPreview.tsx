"use client";

import { useState, useCallback, useEffect } from "react";
import { QRDisplay } from "@/components/qr/QRDisplay";
import { useLastGeneratedStore } from "@/stores/lastGeneratedStore";

type PreviewData = {
  qrBase64: string;
  url: string;
  reference?: string;
};

export function FormWithPreview({
  children,
  title,
  description,
}: {
  children: (onSuccess: (data: PreviewData) => void) => React.ReactNode;
  title: string;
  description: string;
}) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const lastQR = useLastGeneratedStore((s) => s.lastQR);
  const onSuccess = useCallback((data: PreviewData) => setPreview(data), []);

  // When user clicks "Clear" on Transfer, lastQR becomes null → clear preview
  useEffect(() => {
    if (!lastQR) setPreview(null);
  }, [lastQR]);

  return (
    <div className="container-app py-8">
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      <p className="text-solana-gray mb-2">{description}</p>
      <p className="text-muted-foreground mb-8 text-sm">
        This QR works on any Solana network (Devnet, Mainnet). The payer
        chooses the network in their wallet.
      </p>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>{children(onSuccess)}</div>
        {/* Desktop: single preview in sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Preview</h2>
            {preview ? (
              <QRDisplay
                qrBase64={preview.qrBase64}
                url={preview.url}
                reference={preview.reference}
              />
            ) : (
              <p className="text-solana-gray text-sm">
                QR code will appear here after generation
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Mobile: same preview below the form (no double QR) */}
      {preview && (
        <div className="mt-8 lg:hidden">
          <h2 className="mb-4 text-lg font-semibold">Your Solana Pay QR</h2>
          <QRDisplay
            qrBase64={preview.qrBase64}
            url={preview.url}
            reference={preview.reference}
          />
        </div>
      )}
    </div>
  );
}
