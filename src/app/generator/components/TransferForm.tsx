"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { generateTransferQR } from "../actions";
import type { GenerateQRResponse } from "@/types/solana-pay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QRDisplay } from "@/components/qr/QRDisplay";

type PreviewData = { qrBase64: string; url: string; reference?: string };

export function TransferForm({
  onSuccess,
}: { onSuccess?: (data: PreviewData) => void } = {}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [state, formAction, isPending] = useActionState<
    GenerateQRResponse | null,
    FormData
  >(generateTransferQR, null);

  useEffect(() => {
    if (state?.data && onSuccess) {
      onSuccess({
        qrBase64: state.data.qrBase64,
        url: state.data.url,
        reference: state.data.reference,
      });
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          name="recipient"
          placeholder="HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"
          required
          minLength={32}
          maxLength={44}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (SOL)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          placeholder="0.01"
          required
          title="Minimum 0.01 SOL"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) => {
            const el = e.currentTarget;
            let v = e.target.value;
            if (v.includes(".")) {
              const [, dec] = v.split(".");
              if (dec && dec.length > 2) {
                v = v.slice(0, v.length - (dec.length - 2));
                el.value = v;
              }
            }
            if (v === "" || v === null) {
              el.setCustomValidity("");
              return;
            }
            const num = Number(v);
            if (Number.isNaN(num)) {
              el.setCustomValidity("Invalid number");
            } else if (num < 0) {
              el.setCustomValidity("Amount must be positive");
            } else if (num < 0.01) {
              el.setCustomValidity("Minimum 0.01 SOL");
            } else {
              el.setCustomValidity("");
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="splToken">SPL Token Mint (optional)</Label>
            <Input
              id="splToken"
              name="splToken"
              placeholder="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">
              Reference (auto-generated if empty)
            </Label>
            <Input
              id="reference"
              name="reference"
              placeholder="Leave empty for auto-generation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (merchant name)</Label>
            <Input
              id="label"
              name="label"
              placeholder="My Store"
              maxLength={128}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              name="message"
              placeholder="Payment for coffee"
              maxLength={2048}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">Memo (internal note)</Label>
            <Input id="memo" name="memo" placeholder="Order #12345" />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Generating..." : "Generate QR Code"}
      </Button>

      {state?.error && (
        <div className="text-destructive text-sm">{state.error}</div>
      )}

      {state?.data && (
        <QRDisplay
          qrBase64={state.data.qrBase64}
          url={state.data.url}
          reference={state.data.reference}
          linkParams={
            state.data.params
              ? {
                  recipient: state.data.params.recipient,
                  amount: state.data.params.amount,
                  token:
                    state.data.params.tokenSymbol ||
                    (state.data.params.splToken ? "SPL" : "SOL"),
                  splToken: state.data.params.splToken ?? null,
                  label: state.data.params.label ?? undefined,
                  message: state.data.params.message ?? undefined,
                  memo: state.data.params.memo ?? undefined,
                }
              : undefined
          }
        />
      )}
    </form>
  );
}
