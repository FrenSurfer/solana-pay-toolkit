import { ValidatorView } from "./components/ValidatorView";

export default function ValidatorPage() {
  return (
    <main className="container-app pt-4 pb-5">
      <h1 className="text-2xl font-semibold">Validator</h1>
      <p className="text-muted-foreground mb-6">
        Validate Solana Pay URLs (syntax only).
      </p>
      <ValidatorView />
    </main>
  );
}
