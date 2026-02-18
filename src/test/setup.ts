import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Solana web3.js
vi.mock("@solana/web3.js", () => ({
  PublicKey: class {
    toBase58: () => string;
    constructor(key: string) {
      this.toBase58 = () => key;
    }
  },
  Connection: class {
    getAccountInfo = vi.fn();
    getLatestBlockhash = vi.fn();
    simulateTransaction = vi.fn();
  },
  Keypair: {
    generate: vi.fn(() => ({
      publicKey: { toBase58: () => "mock" + Math.random().toString(36).slice(2) },
    })),
  },
  clusterApiUrl: vi.fn(() => "https://api.devnet.solana.com"),
  SystemProgram: {},
  Transaction: class {},
}));
