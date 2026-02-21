"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { generateTransactionRequestQR } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PreviewData = { qrBase64: string; url: string; reference?: string };

export function TransactionForm({
  onSuccess,
}: { onSuccess?: (data: PreviewData) => void } = {}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const link = (formData.get("link") as string) ?? "";
      const label = (formData.get("label") as string) || undefined;
      const message = (formData.get("message") as string) || undefined;
      return generateTransactionRequestQR(link, label, message);
    },
    null
  );

  useEffect(() => {
    if (state?.data && onSuccess) {
      onSuccess({
        qrBase64: state.data.qrBase64,
        url: state.data.url,
      });
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="link">Server URL (HTTPS)</Label>
        <Input
          id="link"
          name="link"
          type="url"
          placeholder="https://api.example.com/solana-pay"
          required
        />
        <p className="text-solana-gray text-xs">
          This endpoint must handle GET requests and return transactions
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Merchant Name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          name="message"
          placeholder="Payment description"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Generating..." : "Generate Request QR"}
      </Button>

      {state?.error && (
        <div className="text-destructive text-sm">{state.error}</div>
      )}
      {/* QR is shown only in FormWithPreview (one place, no double render) */}
    </form>
  );
}
