import { Connection, clusterApiUrl } from "@solana/web3.js";
import type { Network } from "@/types/solana-pay";

export function getConnection(network: Network): Connection {
  if (network === "devnet") {
    return new Connection(
      process.env.SOLANA_RPC_URL_DEVNET ?? clusterApiUrl("devnet")
    );
  }
  if (network === "mainnet") {
    return new Connection(
      process.env.SOLANA_RPC_URL_MAINNET ?? clusterApiUrl("mainnet-beta")
    );
  }
  if (network === "localnet") {
    return new Connection("http://127.0.0.1:8899");
  }
  throw new Error("Unsupported network");
}
