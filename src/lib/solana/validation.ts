import { PublicKey } from "@solana/web3.js";

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

/**
 * Validation stricte d'une adresse Solana.
 * Vérifie : base58, longueur 32–44, et checksum Ed25519 valide (via PublicKey).
 */
export function isValidPublicKey(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }
  if (!BASE58_REGEX.test(address)) {
    return false;
  }
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function validateRecipient(address: string): {
  valid: boolean;
  error?: string;
  isTruncated?: boolean;
} {
  if (!address) {
    return { valid: false, error: "Address is required" };
  }
  if (address.length < 32) {
    return { valid: false, error: "Address too short (min 32 chars)" };
  }
  if (address.length > 44) {
    return { valid: false, error: "Address too long (max 44 chars)" };
  }
  if (address.length === 43 && !isValidPublicKey(address)) {
    return {
      valid: false,
      error: "Invalid address - possible truncation detected",
      isTruncated: true,
    };
  }
  if (!isValidPublicKey(address)) {
    return { valid: false, error: "Invalid Solana address (checksum failed)" };
  }
  return { valid: true };
}
