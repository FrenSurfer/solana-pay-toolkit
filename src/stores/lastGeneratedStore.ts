import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LastQRData {
  url: string;
  qrBase64: string;
  reference?: string;
  params?: unknown;
}

type LastQRType = "transfer" | "transactionRequest" | "message";

interface LastGeneratedState {
  lastQR: {
    type: LastQRType;
    data: LastQRData;
    createdAt: number;
  } | null;
  setLastQR: (type: LastQRType, data: LastQRData) => void;
  clearLastQR: () => void;
}

export const useLastGeneratedStore = create<LastGeneratedState>()(
  persist(
    (set) => ({
      lastQR: null,
      setLastQR: (type, data) =>
        set({
          lastQR: { type, data, createdAt: Date.now() },
        }),
      clearLastQR: () => set({ lastQR: null }),
    }),
    {
      name: "solana-pay-last-generated",
      partialize: (state) => ({ lastQR: state.lastQR }),
    }
  )
);
