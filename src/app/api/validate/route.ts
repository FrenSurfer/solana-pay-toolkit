import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateOnChain } from "@/lib/solana/validation-engine";
import type { Network } from "@/types/solana-pay";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    (req as NextRequest & { ip?: string }).ip ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfter } = await rateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter ?? 60) },
      }
    );
  }

  try {
    const { recipient, network = "devnet", tokenMint } = await req.json();

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient required" },
        { status: 400 }
      );
    }

    const result = await validateOnChain(
      recipient,
      network as Network,
      tokenMint
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
