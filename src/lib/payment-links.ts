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

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ACTIVE_LINKS = 50;

/** Remove expired pending links; if still over limit, remove oldest by createdAt (max 50 links in memory) */
function evictIfNeeded(): void {
  const now = Date.now();
  for (const [id, link] of links.entries()) {
    if (link.status === "pending" && now > link.expiresAt) {
      links.delete(id);
    }
  }
  if (links.size <= MAX_ACTIVE_LINKS) return;
  const byOldest = Array.from(links.entries()).sort(
    ([, a], [, b]) => a.createdAt - b.createdAt
  );
  let toRemove = links.size - MAX_ACTIVE_LINKS;
  for (const [id] of byOldest) {
    if (toRemove <= 0) break;
    links.delete(id);
    toRemove--;
  }
}

export function createLink(
  data: Omit<
    PaymentLink,
    "id" | "reference" | "createdAt" | "expiresAt" | "status"
  >
): PaymentLink {
  evictIfNeeded();

  const id = nanoid(8);
  const reference = crypto.randomUUID();
  const now = Date.now();

  const link: PaymentLink = {
    ...data,
    id,
    reference,
    createdAt: now,
    expiresAt: now + TTL_MS,
    status: "pending",
  };

  links.set(id, link);
  return link;
}

export function getLink(id: string): PaymentLink | null {
  const link = links.get(id);
  if (!link) return null;

  if (Date.now() > link.expiresAt && link.status === "pending") {
    link.status = "expired";
    links.delete(id);
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
