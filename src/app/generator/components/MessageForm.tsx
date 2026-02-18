"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { generateMessageQR } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QRDisplay } from "@/components/qr/QRDisplay";

type PreviewData = { qrBase64: string; url: string; reference?: string };

export function MessageForm({
  onSuccess,
}: { onSuccess?: (data: PreviewData) => void } = {}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const recipient = (formData.get("recipient") as string) ?? "";
      const message = (formData.get("message") as string) ?? "";
      const label = (formData.get("label") as string) || undefined;
      return generateMessageQR(recipient, message, label);
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
        <Label htmlFor="recipient">Signer Address</Label>
        <Input
          id="recipient"
          name="recipient"
          placeholder="Address that will sign the message"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message to Sign</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Enter message here..."
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Request label" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Generating..." : "Generate Sign Request"}
      </Button>

      {state?.error && (
        <div className="text-destructive text-sm">{state.error}</div>
      )}
      {state?.data && (
        <QRDisplay
          qrBase64={state.data.qrBase64}
          url={state.data.url}
        />
      )}
    </form>
  );
}
