"use client";

import { FormWithPreview } from "../components/FormWithPreview";
import { TransactionForm } from "../components/TransactionForm";

export default function TransactionPage() {
  return (
    <FormWithPreview
      title="Transaction Request QR"
      description="Generate QR codes for complex transactions via server endpoint"
    >
      {(onSuccess) => <TransactionForm onSuccess={onSuccess} />}
    </FormWithPreview>
  );
}
