import { Keypair } from "@solana/web3.js";
import { isValidPublicKey } from "./validation";

export function generateReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

export function isValidReference(reference: string): boolean {
  return isValidPublicKey(reference);
}
