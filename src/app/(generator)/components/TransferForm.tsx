"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { generateTransferQR } from "../actions";
import { useHistoryStore } from "@/stores/historyStore";
import { useLastGeneratedStore } from "@/stores/lastGeneratedStore";
import type { GenerateQRResponse, LinkParams } from "@/types/solana-pay";
import {
  getSavedAddresses,
  addSavedAddress,
  removeSavedAddress,
  type SavedAddress,
} from "@/lib/saved-addresses";
import { Input } from "@/components/ui/input";
import { AddressInput } from "@/components/ui/address-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TokenSelector, type TokenOption } from "@/components/ui/token-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Bookmark, Trash2 } from "lucide-react";

const AMOUNT_ERROR_POSITIVE = "Amount must be positive";
const AMOUNT_ERROR_MIN = "Amount must be greater than 0";

type PreviewData = {
  qrBase64: string;
  url: string;
  reference?: string;
  linkParams?: LinkParams;
};

const DEFAULT_TOKEN: TokenOption = {
  symbol: "SOL",
  mint: null,
  decimals: 9,
};

export function TransferForm({
  onSuccess,
}: { onSuccess?: (data: PreviewData) => void } = {}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [token, setToken] = useState<TokenOption>(DEFAULT_TOKEN);
  const [recipient, setRecipient] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const lastSavedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setSavedAddresses(getSavedAddresses());
  }, []);
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
      const params = state.data.params;
      setLastQR("transfer", state.data);
      onSuccess({
        qrBase64: state.data.qrBase64,
        url: state.data.url,
        reference: state.data.reference,
        linkParams: params
          ? {
              recipient: params.recipient,
              amount: params.amount,
              token: ("tokenSymbol" in params && params.tokenSymbol) || (params.splToken ? "SPL" : "SOL"),
              splToken: params.splToken ?? null,
              reference: params.reference,
              label: params.label ?? null,
              message: params.message ?? null,
              memo: params.memo ?? null,
            }
          : undefined,
      });
    }
  }, [state, onSuccess, setLastQR]);

  useEffect(() => {
    if (hasLastQR && onSuccess && !state?.data) {
      const data = lastQR!.data;
      const params = data.params as
        | { recipient?: string; amount?: string; splToken?: string; tokenSymbol?: string; reference?: string; label?: string; message?: string; memo?: string }
        | undefined;
      onSuccess({
        qrBase64: data.qrBase64,
        url: data.url,
        reference: data.reference,
        linkParams: params?.recipient && params?.amount
          ? {
              recipient: params.recipient,
              amount: params.amount,
              token: (params.tokenSymbol as string) || (params.splToken ? "SPL" : "SOL"),
              splToken: params.splToken ?? null,
              reference: params.reference,
              label: params.label ?? null,
              message: params.message ?? null,
              memo: params.memo ?? null,
            }
          : undefined,
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

  const selectedSavedId =
    savedAddresses.find((a) => a.address === recipient.trim())?.id ?? "";
  const canSaveAddress =
    recipient.trim().length >= 32 && !savedAddresses.some((a) => a.address === recipient.trim());

  const handleSaveAddress = () => {
    const label = saveLabel.trim() || "My wallet";
    setSavedAddresses(addSavedAddress(label, recipient.trim()));
    setSaveLabel("");
    setShowSaveInput(false);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedAddresses(removeSavedAddress(id));
    if (savedAddresses.find((a) => a.id === id)?.address === recipient.trim()) {
      setRecipient("");
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          {savedAddresses.length > 0 && (
            <Select
              value={selectedSavedId || "none"}
              onValueChange={(id) => {
                if (id === "none") {
                  setRecipient("");
                  return;
                }
                const addr = savedAddresses.find((a) => a.id === id);
                if (addr) setRecipient(addr.address);
              }}
            >
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue placeholder="Choose a saved address..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Choose a saved address...</SelectItem>
                {savedAddresses.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <AddressInput
          id="recipient"
          name="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"
          required
          minLength={32}
          maxLength={44}
        />
        <div className="flex flex-wrap items-center gap-2">
          {!showSaveInput ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canSaveAddress}
              onClick={() => setShowSaveInput(true)}
            >
              <Bookmark size={14} className="mr-1.5 shrink-0" />
              Save this address
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Label (e.g. My wallet)"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                className="h-8 w-[180px] text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSaveAddress())}
              />
              <Button type="button" size="sm" onClick={handleSaveAddress}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveInput(false);
                  setSaveLabel("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        {savedAddresses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {savedAddresses.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                <span className="max-w-[120px] truncate" title={a.address}>
                  {a.label}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${a.label}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveSaved(a.id)}
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Input
            id="amount"
            name="amount"
            type="number"
            step={10 ** -token.decimals}
            min="0"
            placeholder="0.00"
            required
            title={AMOUNT_ERROR_MIN}
            className="min-w-0 flex-1"
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
          <TokenSelector value={token} onChange={setToken} className="sm:w-auto sm:min-w-[200px]" />
        </div>
        <input type="hidden" name="splToken" value={token.mint ?? ""} />
        <input type="hidden" name="tokenSymbol" value={token.symbol} />
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
