import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  HistoryItem,
  QRType,
  Network,
} from "@/types/solana-pay";

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

export async function getDB(): Promise<IDBPDatabase<SolanaPayDB>> {
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
