import { Simulator } from "./components/Simulator";

export default function SimulatorPage() {
  return (
    <main className="container-app py-8">
      <h1 className="text-2xl font-semibold">Simulator</h1>
      <p className="text-muted-foreground mb-6">
        Simulate Solana Pay flows without sending real funds.
      </p>
      <Simulator />
    </main>
  );
}
