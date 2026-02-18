"use client";

import { FormWithPreview } from "../components/FormWithPreview";
import { MessageForm } from "../components/MessageForm";

export default function MessagePage() {
  return (
    <FormWithPreview
      title="Message Sign QR"
      description="Generate QR codes for message signing (authentication flows)"
    >
      {(onSuccess) => <MessageForm onSuccess={onSuccess} />}
    </FormWithPreview>
  );
}
