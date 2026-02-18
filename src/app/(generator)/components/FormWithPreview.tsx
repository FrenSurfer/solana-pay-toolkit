"use client";

import { useState, useCallback } from "react";
import { QRDisplay } from "@/components/qr/QRDisplay";

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
  const onSuccess = useCallback((data: PreviewData) => setPreview(data), []);

  return (
    <div className="container-app py-8">
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      <p className="text-solana-gray mb-8">{description}</p>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>{children(onSuccess)}</div>
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
    </div>
  );
}
