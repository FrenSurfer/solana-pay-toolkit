# Solana Pay QR Toolkit

> Generate Solana Pay QR codes, validate URLs (syntax), share payment links, and manage your history — no backend or API keys required.

![Solana Pay QR Toolkit](https://img.shields.io/badge/Solana-Pay-9945ff?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge)

## What is this?

A free, open-source web app for working with Solana Pay QR codes. No registration, no API keys, no RPC calls — everything runs in the browser or via lightweight Server Actions.

### Why it exists

| Problem | Solution |
|--------|----------|
| Creating Solana Pay URLs is error-prone | Visual forms with validation (recipient, amount, decimals) |
| Need to share a payment link | **Payment links**: one-click “Get payment link” → shareable `/pay/[id]` page with QR + “Pay with Phantom” (Mobile only)|
| Checking if a QR URL is valid | **Syntax validator**: paste URL or upload QR image, instant format check (no on-chain call) |
| Losing QRs after generation | **Local history**: IndexedDB, real-time search (label, address, message, memo), export/import |

## Features

### 1. QR Generator (Transfer only)

- **Generate** (`/generator`): One form for **Transfer** QRs — recipient, amount, token (SOL, USDC, USDT…), optional label, message, memo. Validation on recipient (base58) and amount (min 0.01 SOL or 1 for tokens, max 2 decimals). After generation: preview, copy URL, download PNG, optional **“Get payment link”** to copy a shareable `/pay/[id]` URL. You can save the QR to local history.

### 2. QR Validator

- **Syntax only**: Paste a Solana Pay URL or drag & drop a QR image. Instant feedback on format (scheme, recipient, amount, token, reference, etc.). **No on-chain verification** — no RPC, no API keys.

### 3. Payment links

- From a generated Transfer QR, click **“Get payment link”**. A shareable URL is copied (e.g. `https://yoursite.com/pay/abc123`). Anyone opening it sees the QR and “Pay with Phantom”; link expires after 7 days. No payment verification, no RPC.

### 4. Local history

- **Auto-save**: Generated QRs are stored in the browser (IndexedDB).
- **Real-time search**: Filter by label, address, message, memo, or URL as you type (no search button; results update as you type; clear the field to show all).
- **Filter by type**: Transfer (and other types if present in your history).
- **Export / Import**: Backup and restore your history as JSON.
- **Private mode**: Detected (e.g. Safari private); history and export/import are disabled with a clear message.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.4+
- **Styling**: Tailwind CSS v4
- **Solana**: `@solana/pay`, `@solana/web3.js` (URL/build only; no RPC in the app)
- **Storage**: IndexedDB (via `idb`), Zustand for state
- **QR**: `qrcode` (server), `jsQR` (client for validator uploads)

## Installation

### Prerequisites

- Node.js 20+
- npm (or yarn)

### Local development

```bash
git clone https://github.com/yourusername/solana-pay-toolkit.git
cd solana-pay-toolkit

npm install

# Optional: env for payment link base URL
cp .env.example .env.local
# Edit .env.local if you need a custom NEXT_PUBLIC_APP_URL

npm run dev
# Open http://localhost:3000
```

## Build for production

```bash
npm run build
npm start
```

For static export (e.g. GitHub Pages), note that Server Actions and the payment links API require a Node server; see your host’s docs.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | Base URL for payment links (e.g. `https://your-domain.com`). Defaults to `http://localhost:3000` in dev. |
| `NEXT_PUBLIC_DEFAULT_NETWORK` | No | Default network label (e.g. `mainnet`). |
| `NEXT_PUBLIC_APP_NAME` | No | App name used in the UI. |

RPC URLs are not used by this app (no on-chain validation).

## Usage

### Creating a payment QR

1. Go to **Generate** (`/generator`).
2. Enter recipient (validated as base58); you can save/use saved addresses.
3. Enter amount and choose token (SOL, USDC, USDT, etc.); min 0.01 SOL (or 1 for SPL), max 2 decimal places.
4. Optionally add label, message, memo in the form.
5. Click **Generate QR Code** → preview appears; download PNG or copy URL.
6. Click **“Get payment link”** to copy a shareable link; anyone opening it sees the same QR and “Pay with Phantom” (link expires in 7 days).

### Validating a QR or URL

1. Go to **Validate**.
2. Paste a Solana Pay URL or upload a QR image.
3. Read the syntax report (format, recipient, amount, etc.). There is no “Verify On-Chain” step.

### Managing history

1. Go to **History**.
2. Type in the search box to filter by label, address, message, or memo in real time; clear the input to show all again.
3. Use the type dropdown and **Clear Filters** if needed.
4. Use **Export** / **Import** to backup or restore your QR list. Each card can show Details (URL, recipient, message), Download, or Delete.

## Architecture (high level)

| Layer | Role |
|-------|------|
| **Browser** | React UI, Zustand, IndexedDB (history), real-time search |
| **Next.js** | Server Actions (QR generation), API routes for payment links only (`/api/links`) |
| **Solana** | `@solana/pay` for URL encoding/parsing; no RPC or on-chain calls in this app |

**Flow:** Form → Server Action → Solana Pay URL + QR image → optional “Get payment link” → optional save to History.

## Security

- **No private keys**: The app never handles private keys.
- **Local storage**: History stays in your browser (IndexedDB).
- **No RPC in app**: No Solana RPC calls, so no RPC keys to expose.
- **Inputs validated**: Addresses and amounts are validated (format, decimals) before building URLs.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -m 'Add your feature'`.
4. Push: `git push origin feature/your-feature`.
5. Open a Pull Request.

## Development

- TypeScript strict mode.
- Prefer Server Components; use Client Components only when needed (forms, browser APIs).
- Add tests for validation logic; run with `npm run test` / `npm run test:run`.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [Solana Pay Specification](https://docs.solanapay.com/spec)
- [Solana Labs](https://solana.com)

---

**Built for the Solana developer community**
