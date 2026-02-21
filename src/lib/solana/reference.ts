import { Keypair } from "@solana/web3.js";

export function generateReference(): string {
  return Keypair.generate().publicKey.toBase58();
}
