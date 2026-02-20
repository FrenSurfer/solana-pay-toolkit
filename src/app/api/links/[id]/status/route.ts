import { NextRequest, NextResponse } from "next/server";
import { getLinkStatus } from "@/lib/payment-links";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const status = getLinkStatus(id);

  if (!status) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json(status);
}
