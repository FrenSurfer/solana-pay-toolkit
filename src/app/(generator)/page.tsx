"use client";

import { FormWithPreview } from "./components/FormWithPreview";
import { TransferForm } from "./components/TransferForm";

export default function TransferPage() {
  return (
    <FormWithPreview
      title="Generate Transfer QR"
      description="Create Solana Pay QR codes for simple transfers"
    >
      {(onSuccess) => <TransferForm onSuccess={onSuccess} />}
    </FormWithPreview>
  );
}
