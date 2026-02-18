"use client";

import { useState } from "react";
import {
  SCENARIOS,
  simulateTransfer,
  type SimulationScenario,
} from "@/lib/solana/simulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SimResult = Awaited<ReturnType<typeof simulateTransfer>>;

export function Simulator() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [scenario, setScenario] = useState<SimulationScenario>(SCENARIOS[0]);
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const simResult = await simulateTransfer(
        recipient,
        amount,
        "devnet",
        scenario
      );
      setResult(simResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4">
        <p className="text-blue-200 text-sm">
          This simulates transactions without sending real funds. Uses
          devnet RPC for estimation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sim-recipient">Recipient Address</Label>
        <Input
          id="sim-recipient"
          placeholder="HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sim-amount">Amount (SOL)</Label>
        <Input
          id="sim-amount"
          type="number"
          step="0.000000001"
          min="0"
          placeholder="0.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Test Scenario</Label>
        <Select
          value={scenario.name}
          onValueChange={(name) => {
            const s = SCENARIOS.find((x) => x.name === name);
            if (s) setScenario(s);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCENARIOS.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name} ({s.payerBalance} SOL)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={runSimulation}
        disabled={loading || !recipient || !amount}
        className="w-full"
      >
        {loading ? "Running..." : "Run Simulation"}
      </Button>

      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.success
              ? "border border-green-800/50 bg-green-950/30"
              : "border border-red-800/50 bg-red-950/30"
          }`}
        >
          <p className="font-semibold">
            Result: {result.success ? "Would Succeed" : "Would Fail"}
          </p>
          {result.reason && (
            <p className="text-muted-foreground text-sm">
              Reason: {result.reason}
            </p>
          )}
          {result.transactionFee && (
            <p className="text-sm">Est. Fee: {result.transactionFee} SOL</p>
          )}
        </div>
      )}
    </div>
  );
}
