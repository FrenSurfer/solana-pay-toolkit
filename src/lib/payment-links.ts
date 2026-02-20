import { nanoid } from "nanoid";

export type PaymentStatus = "pending" | "paid" | "expired";

export interface PaymentLink {
  id: string;
  reference: string;
  recipient: string;
  amount: string;
  token: string;
  splToken?: string;
  label: string;
  message?: string;
  memo?: string;
  createdAt: number;
  expiresAt: number;
  status: PaymentStatus;
  paidAt?: number;
  signature?: string;
}

// Use globalThis so the same Map is shared across API routes and Server Components
// (Next.js dev can load the module multiple times; without this, POST and GET see different stores)
const KEY = "__solana_pay_links";
const g = globalThis as unknown as Record<string, Map<string, PaymentLink>>;
if (!g[KEY]) g[KEY] = new Map();
const links = g[KEY];

const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createLink(
  data: Omit<
    PaymentLink,
    "id" | "reference" | "createdAt" | "expiresAt" | "status"
  >
): PaymentLink {
  const id = nanoid(8);
  const reference = crypto.randomUUID();
  const now = Date.now();

  const link: PaymentLink = {
    ...data,
    id,
    reference,
    createdAt: now,
    expiresAt: now + TTL,
    status: "pending",
  };

  links.set(id, link);
  return link;
}

export function getLink(id: string): PaymentLink | null {
  const link = links.get(id);
  if (!link) return null;

  // Auto-expire if past TTL
  if (Date.now() > link.expiresAt && link.status === "pending") {
    link.status = "expired";
  }

  return link;
}

export function markPaid(id: string, signature: string): boolean {
  const link = links.get(id);
  if (!link || link.status !== "pending") return false;

  link.status = "paid";
  link.paidAt = Date.now();
  link.signature = signature;
  return true;
}

export function getLinkStatus(
  id: string
): { status: PaymentStatus; paidAt?: number; expiresAt: number } | null {
  const link = getLink(id);
  if (!link) return null;

  return {
    status: link.status,
    paidAt: link.paidAt,
    expiresAt: link.expiresAt,
  };
}
