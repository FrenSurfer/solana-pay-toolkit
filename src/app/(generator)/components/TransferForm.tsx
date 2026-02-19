"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { generateTransferQR } from "../actions";
import { useHistoryStore } from "@/stores/historyStore";
import { useLastGeneratedStore } from "@/stores/lastGeneratedStore";
import type { GenerateQRResponse } from "@/types/solana-pay";
import { Input } from "@/components/ui/input";
import { AddressInput } from "@/components/ui/address-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const AMOUNT_ERROR_POSITIVE = "Amount must be positive";
const AMOUNT_ERROR_MIN = "Amount must be greater than 0";

type PreviewData = { qrBase64: string; url: string; reference?: string };

export function TransferForm({
  onSuccess,
}: { onSuccess?: (data: PreviewData) => void } = {}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const lastSavedUrlRef = useRef<string | null>(null);
  const addItem = useHistoryStore((s) => s.addItem);
  const { lastQR, setLastQR, clearLastQR } = useLastGeneratedStore();
  const [state, formAction, isPending] = useActionState<
    GenerateQRResponse | null,
    FormData
  >(generateTransferQR, null);

  const hasLastQR = lastQR?.type === "transfer" && lastQR?.data;

  // Feed preview: new result or restored last QR when coming back to the page
  useEffect(() => {
    if (state?.data && onSuccess) {
      setLastQR("transfer", state.data);
      onSuccess({
        qrBase64: state.data.qrBase64,
        url: state.data.url,
        reference: state.data.reference,
      });
    }
  }, [state, onSuccess, setLastQR]);

  useEffect(() => {
    if (hasLastQR && onSuccess && !state?.data) {
      onSuccess({
        qrBase64: lastQR!.data.qrBase64,
        url: lastQR!.data.url,
        reference: lastQR!.data.reference,
      });
    }
  }, [hasLastQR, lastQR, onSuccess, state?.data]);

  // Clear preview in parent when user clicks Clear
  const handleClear = () => {
    clearLastQR();
  };

  // Auto-save to history when generation succeeds (once per result)
  useEffect(() => {
    if (!state?.data?.url || state.data.url === lastSavedUrlRef.current) return;
    const params = state.data.params;
    if (!params) return;
    lastSavedUrlRef.current = state.data.url;
    addItem({
      type: "transfer",
      label: params.label || "Transfer QR",
      params,
      qrDataUrl: `data:image/png;base64,${state.data.qrBase64}`,
      url: state.data.url,
    }).catch(() => {
      lastSavedUrlRef.current = null;
    });
  }, [state?.data, addItem]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <AddressInput
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
          step="0.000000001"
          min="0.000000001"
          placeholder="0.5"
          required
          title={AMOUNT_ERROR_MIN}
          onChange={(e) => {
            const el = e.currentTarget;
            const v = e.target.value;
            if (v === "" || v === null) {
              el.setCustomValidity("");
              return;
            }
            const num = Number(v);
            if (Number.isNaN(num)) {
              el.setCustomValidity("Invalid number");
            } else if (num < 0) {
              el.setCustomValidity(AMOUNT_ERROR_POSITIVE);
            } else if (num === 0) {
              el.setCustomValidity(AMOUNT_ERROR_MIN);
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
        <div className="space-y-4 rounded-lg border border-border p-4">
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

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? "Generating..."
            : hasLastQR
              ? "Generate New QR Code"
              : "Generate QR Code"}
        </Button>
        {hasLastQR && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground w-full text-sm"
          >
            <X size={14} className="mr-1.5 shrink-0" />
            Clear & Start New
          </Button>
        )}
      </div>

      {state?.error && (
        <div className="text-destructive text-sm">{state.error}</div>
      )}

      {/* QR is shown only in FormWithPreview (one place, no double render) */}
    </form>
  );
}
