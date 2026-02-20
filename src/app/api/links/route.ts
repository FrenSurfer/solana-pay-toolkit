import { NextRequest, NextResponse } from "next/server";
import { createLink } from "@/lib/payment-links";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const link = createLink({
      recipient: body.recipient,
      amount: body.amount,
      token: body.token || "SOL",
      splToken: body.splToken,
      label: body.label || "Payment",
      message: body.message,
      memo: body.memo,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      id: link.id,
      url: `${baseUrl}/pay/${link.id}`,
      qrUrl: `${baseUrl}/pay/${link.id}?qr=1`,
      reference: link.reference,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
