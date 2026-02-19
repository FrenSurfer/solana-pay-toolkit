import { create } from "zustand";
import type {
  HistoryItem,
  QRType,
  Network,
} from "@/types/solana-pay";
import {
  addToHistory,
  getHistory,
  deleteFromHistory,
} from "@/lib/db/history";

interface HistoryState {
  items: HistoryItem[];
  loading: boolean;
  privateMode: boolean;
  filter: {
    type?: QRType;
    network?: Network;
    search?: string;
  };
  addItem: (
    item: Omit<HistoryItem, "id" | "timestamp">
  ) => Promise<void>;
  loadItems: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setFilter: (filter: Partial<HistoryState["filter"]>) => void;
  filteredItems: () => HistoryItem[];
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  items: [],
  loading: false,
  privateMode: false,
  filter: {},

  addItem: async (item) => {
    const optimisticId = crypto.randomUUID();
    const optimisticItem: HistoryItem = {
      ...item,
      id: optimisticId,
      timestamp: Date.now(),
    };
    set((state) => ({ items: [optimisticItem, ...state.items] }));

    try {
      const saved = await addToHistory(item);
      set((state) => ({
        items: state.items.map((i) => (i.id === optimisticId ? saved : i)),
      }));
    } catch (err) {
      set((state) => ({
        items: state.items.filter((i) => i.id !== optimisticId),
      }));
      if (
        err instanceof Error &&
        err.message.includes("Private browsing")
      ) {
        set({ privateMode: true });
      }
      throw err;
    }
  },

  loadItems: async () => {
    set({ loading: true, privateMode: false });
    try {
      const items = await getHistory(
        100,
        get().filter.type,
        get().filter.network
      );
      set({ items, loading: false, privateMode: false });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("Private browsing")
      ) {
        set({ privateMode: true, loading: false, items: [] });
      } else {
        set({ loading: false });
        console.error("Failed to load history:", err);
      }
    }
  },

  deleteItem: async (id) => {
    await deleteFromHistory(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  filteredItems: () => {
    const { items, filter } = get();
    return items.filter((item) => {
      if (filter.type && item.type !== filter.type) return false;
      if (filter.network && item.network !== filter.network) return false;
      if (filter.search) {
        const search = filter.search.toLowerCase();
        const recipient =
          "recipient" in item.params ? item.params.recipient : "";
        const label = item.label ?? "";
        return (
          label.toLowerCase().includes(search) ||
          recipient.toLowerCase().includes(search)
        );
      }
      return true;
    });
  },
}));
