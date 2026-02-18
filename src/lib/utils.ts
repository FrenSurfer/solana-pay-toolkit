import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSolanaAddress(address: string): string {
  if (address.length < 9) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
