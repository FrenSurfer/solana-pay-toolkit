# Solana Pay QR Toolkit

> The complete developer toolkit for Solana Pay — Generate, validate, and simulate QR codes without infrastructure.

![Solana Pay QR Toolkit](https://img.shields.io/badge/Solana-Pay-9945ff?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge)

## What is this?

A free, open-source web application that helps developers and merchants work with Solana Pay QR codes. No registration, no API keys, no backend infrastructure required.

### Why it exists

| Problem                                 | Solution                              |
| --------------------------------------- | ------------------------------------- |
| Creating Solana Pay URLs is error-prone | Visual form with real-time validation |
| Testing requires real SOL               | Dry-run simulation with zero risk     |
| QR validation requires mobile wallet    | Instant syntax + on-chain validation  |
| Lost QRs after generation               | Automatic local history with search   |

## Features

### 1. QR Generator (3 Modes)

- **Transfer**: Simple SOL/SPL token payments
- **Transaction Request**: Complex payments with server backend
- **Message Sign**: Authentication & proof-of-ownership

### 2. QR Validator

- **Syntax validation**: Instant feedback on URL format
- **Image upload**: Drag & drop QR images for decoding
- **On-chain verification**: Check if recipient exists before payment

### 3. Payment Simulator

- **Zero-risk testing**: Simulate transactions without sending funds
- **Scenario testing**: Test with different wallet balances
- **Fee estimation**: Know costs before real payment

### 4. Local History

- **Auto-save**: All generated QRs stored locally
- **Full-text search**: Find by label, address, or amount
- **Network filter**: Separate devnet and mainnet QRs
- **Export/Import**: Backup your QR library

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.4+
- **Styling**: Tailwind CSS v4
- **Solana**: `@solana/pay`, `@solana/web3.js`
- **Storage**: IndexedDB (local browser storage)
- **State**: Zustand

## Installation

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/solana-pay-toolkit.git
cd solana-pay-toolkit

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your RPC URLs (optional, defaults to public endpoints)

# Run dev server
npm run dev

# Open http://localhost:3000

```

## Build for Production

```bash
Copy
# Static export (for GitHub Pages, Netlify, Vercel, etc.)
npm run build


```

## 🔧 Configuration

Environment Variables

| Variable                      | Required | Default                               | Description                   |
| ----------------------------- | -------- | ------------------------------------- | ----------------------------- |
| `SOLANA_RPC_URL_DEVNET`       | No       | `https://api.devnet.solana.com`       | Devnet RPC endpoint           |
| `SOLANA_RPC_URL_MAINNET`      | No       | `https://api.mainnet-beta.solana.com` | Mainnet RPC endpoint          |
| `NEXT_PUBLIC_DEFAULT_NETWORK` | No       | `devnet`                              | Default network for new users |

## Usage Guide

### Creating a Payment QR

1. Go to **Generate** → **Transfer**
2. Enter recipient address (validation happens automatically)
3. Enter amount and select token (SOL, USDC, USDT)
4. (Optional) Add label, message, or reference
5. Click **Generate QR Code**
6. Download PNG or copy URL

### Validating an Existing QR

1. Go to **Validate**
2. Either paste the Solana Pay URL directly or drag & drop a QR image
3. Review validation report
4. Click **Verify On-Chain** to check blockchain state

### Simulating a Payment

1. Go to **Simulate**
2. Enter QR URL or scan image
3. Select test scenario
4. Review simulation result and estimated fees

### Managing History

1. Go to **History**
2. Use search bar to find specific QRs
3. Filter by network or type
4. Click any QR to re-download or delete

## Architecture


| Layer              | Components                 | Purpose                   |
| ------------------ | -------------------------- | ------------------------- |
| **Client Browser** | React, Zustand, IndexedDB  | UI, state, local storage  |
| **Next.js 16**     | Server Actions, API Routes | QR generation, validation |
| **Solana**         | Solana Pay lib, RPC nodes  | Blockchain interaction    |

**Data Flow:**  
Browser Input → Server Action → Solana Pay URL → QR Image → IndexedDB Storage  
Validation Request → API Route → RPC Call → Result to Browser

## Security

- **No private keys**: This tool never handles private keys
- **Local-only storage**: All data stays in your browser
- **Server-side RPC**: API keys never exposed to client
- **Input sanitization**: All URLs and addresses validated before processing

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Development Guidelines

- Follow TypeScript strict mode
- Use Server Components by default
- Add tests for new validation logic
- Update types for new Solana Pay features

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

- [Solana Pay Specification](https://docs.solanapay.com/spec)
- [Solana Labs](https://solana.com) for the ecosystem
- [QuickNode](https://quicknode.com) for RPC infrastructure (optional)

---

**Built with ❤️ for the Solana developer community**
