import { NextRequest, NextResponse } from "next/server";
import { validateOnChain } from "@/lib/solana/validation-engine";
import type { Network } from "@/types/solana-pay";

export async function POST(req: NextRequest) {
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
