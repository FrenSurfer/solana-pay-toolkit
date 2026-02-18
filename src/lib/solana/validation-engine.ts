import { parseURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type {
  ValidationResult,
  ValidationError,
  OnChainValidation,
  Network,
} from "@/types/solana-pay";
import { isValidPublicKey } from "./validation";
import { validateAmount } from "./amount";
import { getConnection } from "./connection";

export function validateURLSyntax(url: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const parsed: ValidationResult["parsed"] = {};

  if (!url.startsWith("solana:")) {
    errors.push({
      field: "scheme",
      code: "INVALID_SCHEME",
      message: "URL must start with solana:",
    });
    return { valid: false, errors, warnings, parsed };
  }

  try {
    const parsedURL = parseURL(url);

    if (!("recipient" in parsedURL)) {
      // Transaction request URL - minimal validation
      parsed.label = parsedURL.label ?? undefined;
      parsed.message = parsedURL.message ?? undefined;
      return {
        valid: true,
        errors: [],
        warnings: [],
        parsed,
      };
    }

    if (!isValidPublicKey(parsedURL.recipient.toBase58())) {
      errors.push({
        field: "recipient",
        code: "INVALID_RECIPIENT",
        message: "Invalid recipient address",
      });
    } else {
      parsed.recipient = parsedURL.recipient.toBase58();
    }

    if (parsedURL.amount) {
      const amountValidation = validateAmount(parsedURL.amount.toString());
      if (!amountValidation.valid) {
        errors.push({
          field: "amount",
          code: "INVALID_AMOUNT",
          message: amountValidation.error ?? "Invalid amount",
        });
      } else {
        parsed.amount = parsedURL.amount.toString();
      }
    }

    if (parsedURL.splToken) {
      if (!isValidPublicKey(parsedURL.splToken.toBase58())) {
        errors.push({
          field: "splToken",
          code: "INVALID_TOKEN",
          message: "Invalid SPL token mint",
        });
      } else {
        parsed.token = parsedURL.splToken.toBase58();
      }
    }

    if (parsedURL.reference?.length) {
      const ref = parsedURL.reference[0];
      if (!ref || !isValidPublicKey(ref.toBase58())) {
        warnings.push({
          field: "reference",
          code: "INVALID_REFERENCE",
          message: "Invalid reference format",
        });
      } else {
        parsed.reference = ref.toBase58();
      }
    }

    if (parsedURL.label !== undefined) {
      if (parsedURL.label.length > 128) {
        warnings.push({
          field: "label",
          code: "LABEL_TOO_LONG",
          message: "Label exceeds 128 characters",
        });
      } else {
        parsed.label = parsedURL.label;
      }
    }

    if (parsedURL.message !== undefined) {
      if (parsedURL.message.length > 2048) {
        warnings.push({
          field: "message",
          code: "MESSAGE_TOO_LONG",
          message: "Message exceeds 2048 characters",
        });
      } else {
        parsed.message = parsedURL.message;
      }
    }
  } catch {
    errors.push({
      field: "parse",
      code: "PARSE_ERROR",
      message: "Failed to parse Solana Pay URL",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed: errors.length === 0 ? parsed : undefined,
  };
}

export async function validateOnChain(
  recipient: string,
  network: Network,
  tokenMint?: string
): Promise<OnChainValidation> {
  const connection = getConnection(network);

  try {
    const pubkey = new PublicKey(recipient);
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo) {
      return {
        valid: false,
        accountExists: false,
        isExecutable: false,
      };
    }

    if (accountInfo.executable) {
      return {
        valid: false,
        accountExists: true,
        isExecutable: true,
      };
    }

    let tokenAccountExists: boolean | undefined;
    if (tokenMint) {
      try {
        const mintPubkey = new PublicKey(tokenMint);
        const ata = getAssociatedTokenAddressSync(
          mintPubkey,
          pubkey
        );
        const tokenAccount = await connection.getAccountInfo(ata);
        tokenAccountExists = tokenAccount !== null;
      } catch {
        tokenAccountExists = false;
      }
    }

    return {
      valid: true,
      accountExists: true,
      isExecutable: false,
      balance: accountInfo.lamports.toString(),
      tokenAccountExists,
    };
  } catch {
    return {
      valid: false,
      accountExists: false,
      isExecutable: false,
    };
  }
}
