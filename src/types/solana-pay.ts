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

export interface OnChainValidation {
  valid: boolean;
  accountExists: boolean;
  isExecutable: boolean;
  balance?: string;
  tokenAccountExists?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRType;
  label: string;
  network: Network;
  params: TransferParams | TransactionRequestParams | MessageParams;
  qrDataUrl: string;
  url: string;
}

export interface HistoryFilter {
  type?: QRType;
  network?: Network;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface GenerateQRResponse {
  success: boolean;
  data?: {
    url: string;
    qrBase64: string;
    reference?: string;
  };
  error?: string;
}

export interface ValidateResponse {
  syntax: ValidationResult;
  onChain?: OnChainValidation;
}
