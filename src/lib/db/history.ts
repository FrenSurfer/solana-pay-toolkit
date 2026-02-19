import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { z } from "zod";
import type {
  HistoryItem,
  QRType,
  Network,
} from "@/types/solana-pay";

const HistoryItemImportSchema = z.object({
  type: z.enum(["transfer", "transactionRequest", "message"]),
  label: z.string().optional(),
  network: z.enum(["devnet", "mainnet", "localnet"]),
  params: z.record(z.string(), z.unknown()),
  qrDataUrl: z.string().startsWith("data:image"),
  url: z.string().startsWith("solana:"),
});

interface SolanaPayDB extends DBSchema {
  history: {
    key: string;
    value: HistoryItem;
    indexes: {
      "by-timestamp": number;
      "by-type": QRType;
      "by-network": Network;
    };
  };
}

const DB_NAME = "solana-pay-toolkit";
const DB_VERSION = 1;

function isPrivateBrowsingMode(): boolean {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return false;
  } catch {
    return true;
  }
}

export async function getDB(): Promise<IDBPDatabase<SolanaPayDB>> {
  if (isPrivateBrowsingMode()) {
    throw new Error(
      "Private browsing mode detected. History is unavailable."
    );
  }
  return openDB<SolanaPayDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const historyStore = db.createObjectStore("history", { keyPath: "id" });
      historyStore.createIndex("by-timestamp", "timestamp");
      historyStore.createIndex("by-type", "type");
      historyStore.createIndex("by-network", "network");
    },
  });
}

export async function addToHistory(
  item: Omit<HistoryItem, "id" | "timestamp">
): Promise<HistoryItem> {
  const db = await getDB();
  const fullItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await db.add("history", fullItem);
  return fullItem;
}

export async function getHistory(
  limit = 100,
  type?: QRType,
  network?: Network
): Promise<HistoryItem[]> {
  const db = await getDB();
  let items: HistoryItem[] = [];

  if (type) {
    items = await db.getAllFromIndex("history", "by-type", type);
  } else if (network) {
    items = await db.getAllFromIndex("history", "by-network", network);
  } else {
    items = await db.getAll("history");
  }

  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function deleteFromHistory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("history", id);
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("history");
}

export async function exportHistory(): Promise<string> {
  const db = await getDB();
  const items = await db.getAll("history");
  return JSON.stringify(items, null, 2);
}

export async function importHistory(
  jsonString: string
): Promise<{ imported: number; errors: number }> {
  const db = await getDB();
  let imported = 0;
  let errors = 0;

  try {
    const items = JSON.parse(jsonString) as HistoryItem[];
    if (!Array.isArray(items)) throw new Error("Invalid JSON format");

    const tx = db.transaction("history", "readwrite");
    const store = tx.objectStore("history");

    for (const item of items) {
      const parsed = HistoryItemImportSchema.safeParse(item);
      if (!parsed.success) {
        errors++;
        continue;
      }
      try {
        const data = parsed.data;
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: data.type,
          label: data.label ?? "",
          network: data.network,
          params: data.params as unknown as HistoryItem["params"],
          qrDataUrl: data.qrDataUrl,
          url: data.url,
        };
        await store.add(newItem);
        imported++;
      } catch {
        errors++;
      }
    }

    await tx.done;
    return { imported, errors };
  } catch {
    throw new Error("Invalid JSON format");
  }
}
