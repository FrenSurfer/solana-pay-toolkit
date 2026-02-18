declare namespace NodeJS {
  interface ProcessEnv {
    SOLANA_RPC_URL_DEVNET: string;
    SOLANA_RPC_URL_MAINNET: string;
    NEXT_PUBLIC_DEFAULT_NETWORK: "devnet" | "mainnet";
  }
}
