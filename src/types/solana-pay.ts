export type Network = "devnet" | "mainnet" | "localnet";
export type QRType = "transfer" | "transactionRequest" | "message";

export interface SolanaPayURL {
  type: QRType;
  url: string;
  raw: string;
}

export interface TransferParams {
  recipient: string;
  amount: string;
  splToken?: string;
  /** Display symbol (e.g. SOL, USDC) for history; derived from token selector */
  tokenSymbol?: string;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
}

export interface TransferQR extends TransferParams {
  type: "transfer";
  generatedAt: Date;
  qrDataUrl: string;
}

export interface TransactionRequestParams {
  link: string;
  label?: string;
  message?: string;
}

export interface TransactionRequestQR extends TransactionRequestParams {
  type: "transactionRequest";
  generatedAt: Date;
  qrDataUrl: string;
}

export interface MessageParams {
  recipient: string;
  message: string;
  label?: string;
}

export interface MessageQR extends MessageParams {
  type: "message";
  generatedAt: Date;
  qrDataUrl: string;
}

export type QRItem = TransferQR | TransactionRequestQR | MessageQR;

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  parsed?: {
    recipient?: string;
    amount?: string;
    token?: string;
    reference?: string;
    label?: string;
    message?: string;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRType;
  label: string;
  /** @deprecated QR works on any network; kept for backward compat with existing IndexedDB data */
  network?: Network;
  params: TransferParams | TransactionRequestParams | MessageParams;
  qrDataUrl: string;
  url: string;
}

export interface HistoryFilter {
  type?: QRType;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/** Params for creating a shareable payment link (transfer only) */
export interface LinkParams {
  recipient: string;
  amount: string;
  token: string;
  splToken?: string | null;
  reference?: string;
  label?: string | null;
  message?: string | null;
  memo?: string | null;
}

export interface GenerateQRResponse {
  success: boolean;
  data?: {
    url: string;
    qrBase64: string;
    reference?: string;
    /** Transfer params (for history) when type is transfer */
    params?: TransferParams;
  };
  error?: string;
}
