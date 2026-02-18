import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export function isValidPublicKey(address: string): boolean {
  try {
    const decoded = bs58.decode(address);
    if (decoded.length !== 32) return false;
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function validateRecipient(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address) return { valid: false, error: "Address is required" };
  if (address.length < 32) return { valid: false, error: "Address too short" };
  if (address.length > 44) return { valid: false, error: "Address too long" };
  if (!isValidPublicKey(address))
    return { valid: false, error: "Invalid base58 encoding" };
  return { valid: true };
}
