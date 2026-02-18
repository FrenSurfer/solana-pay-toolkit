// Verify core imports resolve. Do not use in production.
import { encodeURL } from "@solana/pay";
import { Connection } from "@solana/web3.js";
import QRCode from "qrcode";

export function testImports() {
  return { encodeURL, Connection, QRCode };
}
