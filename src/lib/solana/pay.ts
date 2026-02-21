import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import QRCode from "qrcode";
import type { TransferParams } from "@/types/solana-pay";

export async function generateTransferURL(
  params: TransferParams
): Promise<string> {
  const url = encodeURL({
    recipient: new PublicKey(params.recipient),
    amount: new BigNumber(params.amount),
    splToken: params.splToken ? new PublicKey(params.splToken) : undefined,
    reference: params.reference ? new PublicKey(params.reference) : undefined,
    label: params.label,
    message: params.message,
    memo: params.memo,
  });
  return url.toString();
}

export async function generateQRCode(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
