"use server";

import { generateTransferURL, generateQRCode } from "@/lib/solana/pay";
import { generateReference } from "@/lib/solana/reference";
import { validateRecipient } from "@/lib/solana/validation";
import { validateAmount } from "@/lib/solana/amount";
import type { TransferParams, GenerateQRResponse } from "@/types/solana-pay";

function paramsFromFormData(formData: FormData): TransferParams {
  const splToken = (formData.get("splToken") as string) || undefined;
  const tokenSymbol = (formData.get("tokenSymbol") as string) || undefined;
  return {
    recipient: (formData.get("recipient") as string) ?? "",
    amount: (formData.get("amount") as string) ?? "",
    splToken,
    tokenSymbol: tokenSymbol || (splToken ? "SPL" : undefined),
    reference: (formData.get("reference") as string) || undefined,
    label: (formData.get("label") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
    memo: (formData.get("memo") as string) || undefined,
  };
}

export async function generateTransferQR(
  _prevState: GenerateQRResponse | null,
  formData: FormData
): Promise<GenerateQRResponse> {
  try {
    const params = paramsFromFormData(formData);

    const recipientCheck = validateRecipient(params.recipient);
    if (!recipientCheck.valid) {
      return { success: false, error: recipientCheck.error };
    }

    const amountCheck = validateAmount(params.amount);
    if (!amountCheck.valid) {
      return { success: false, error: amountCheck.error };
    }

    const reference = params.reference || generateReference();

    const url = await generateTransferURL({
      ...params,
      reference,
    });

    const qrBuffer = await generateQRCode(url);
    const qrBase64 = qrBuffer.toString("base64");

    return {
      success: true,
      data: {
        url,
        qrBase64,
        reference,
        params: {
          recipient: params.recipient,
          amount: params.amount,
          splToken: params.splToken,
          tokenSymbol: params.tokenSymbol,
          reference,
          label: params.label,
          message: params.message,
          memo: params.memo,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Generation failed",
    };
  }
}

export async function generateTransactionRequestQR(
  link: string,
  label?: string,
  message?: string
): Promise<GenerateQRResponse> {
  try {
    if (!link.startsWith("https://")) {
      return { success: false, error: "Link must use HTTPS" };
    }
    const urlObj = new URL(link);
    if (label) urlObj.searchParams.set("label", label);
    if (message) urlObj.searchParams.set("message", message);
    const url = `solana:${urlObj.toString()}`;
    const qrBuffer = await generateQRCode(url);
    return {
      success: true,
      data: {
        url,
        qrBase64: qrBuffer.toString("base64"),
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to generate transaction request QR",
    };
  }
}

export async function generateMessageQR(
  recipient: string,
  message: string,
  label?: string
): Promise<GenerateQRResponse> {
  try {
    const recipientCheck = validateRecipient(recipient);
    if (!recipientCheck.valid) {
      return { success: false, error: recipientCheck.error };
    }
    const params = new URLSearchParams();
    params.set("message", message);
    if (label) params.set("label", label);
    const url = `solana:${recipient}?${params.toString()}`;
    const qrBuffer = await generateQRCode(url);
    return {
      success: true,
      data: {
        url,
        qrBase64: qrBuffer.toString("base64"),
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to generate message QR",
    };
  }
}
