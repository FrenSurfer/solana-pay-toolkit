import { NextRequest, NextResponse } from "next/server";
import { getLink } from "@/lib/payment-links";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const link = getLink(id);

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Do not expose full signature publicly
  return NextResponse.json({
    id: link.id,
    recipient: link.recipient,
    amount: link.amount,
    token: link.token,
    splToken: link.splToken ?? undefined,
    label: link.label,
    message: link.message,
    memo: link.memo ?? undefined,
    status: link.status,
    reference: link.reference,
    expiresAt: link.expiresAt,
  });
}
