import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getConnection } from "./connection";

export interface SimulationScenario {
  name: string;
  payerBalance: string;
  expectedResult: "success" | "insufficient_funds" | "account_not_found";
}

export const SCENARIOS: SimulationScenario[] = [
  {
    name: "Sufficient Balance",
    payerBalance: "10",
    expectedResult: "success",
  },
  {
    name: "Insufficient SOL",
    payerBalance: "0.0001",
    expectedResult: "insufficient_funds",
  },
  {
    name: "Empty Wallet",
    payerBalance: "0",
    expectedResult: "insufficient_funds",
  },
];

export async function simulateTransfer(
  recipient: string,
  amount: string,
  network: "devnet" | "mainnet",
  _scenario: SimulationScenario
): Promise<{
  success: boolean;
  reason?: string;
  transactionFee?: string;
}> {
  try {
    const connection = getConnection(network);
    const lamports = new BigNumber(amount).multipliedBy(1e9).toNumber();

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(
          "11111111111111111111111111111111"
        ),
        toPubkey: new PublicKey(recipient),
        lamports,
      })
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const simulation = await connection.simulateTransaction(tx);

    if (simulation.value.err) {
      return {
        success: false,
        reason: JSON.stringify(simulation.value.err),
      };
    }

    return {
      success: true,
      transactionFee: "0.000005",
    };
  } catch (error) {
    return {
      success: false,
      reason:
        error instanceof Error ? error.message : "Simulation failed",
    };
  }
}
