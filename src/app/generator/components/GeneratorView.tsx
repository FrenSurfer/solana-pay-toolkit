"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransferForm } from "./TransferForm";
import { TransactionForm } from "./TransactionForm";
import { MessageForm } from "./MessageForm";
import { QRDisplay } from "@/components/qr/QRDisplay";

type PreviewData = {
  qrBase64: string;
  url: string;
  reference?: string;
};

export function GeneratorView() {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const onSuccess = useCallback((data: PreviewData) => {
    setPreview(data);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
          </TabsList>
          <TabsContent value="transfer">
            <TransferForm onSuccess={onSuccess} />
          </TabsContent>
          <TabsContent value="transaction">
            <TransactionForm onSuccess={onSuccess} />
          </TabsContent>
          <TabsContent value="message">
            <MessageForm onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-8">
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
  );
}
