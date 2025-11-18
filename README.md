# Kzero Wallet

> A zero-knowledge proof based wallet system for Polkadot ecosystem, enabling OAuth-powered account management with enhanced privacy and security.

## Features

- **Zero-Knowledge Authentication** - OAuth login (Google, Twitter, GitHub, etc.) without exposing JWT tokens
- **Type-Safe Communication** - Fully typed iframe messaging using MessageChannel API
- **React Integration** - Easy-to-use hooks and components for DApp integration
- **Dynamic Theming** - Customizable UI with light/dark themes and brand colors
- **Modular Architecture** - Framework-agnostic core with optional React bindings
- **Security First** - PIN-encrypted key storage with XChaCha20-Poly1305 and PBKDF2

## Project Structure

This is a **pnpm monorepo** managed by **Turbo**, containing NPM packages and applications:

```
kzero-wallet/
├── packages/              # NPM publishable SDK packages
│   ├── zk-core/          # Core types and ZK proof utilities
│   ├── message-port/     # Type-safe iframe communication library
│   ├── zk-react/         # React integration (Provider, hooks, components)
│   └── dev/              # Shared development configuration
└── apps/                  # Applications
    ├── wallet/           # Official wallet UI (runs as iframe)
    └── playground/       # SDK integration example with theme customization
```

### Dependency Graph

```
┌─────────────────┐
│  apps/wallet    │──── Authentication UI + Message handling
└────────┬────────┘
         │
┌────────▼────────┐
│ apps/playground │──── SDK integration demo
└────────┬────────┘
         │
┌────────▼────────┐
│  @kzero/        │
│  zk-react       │──── React Provider + hooks + components
└────────┬────────┘
         │
    ┌────┴────┬──────────────────┐
    │         │                   │
┌───▼────┐ ┌─▼──────────┐  ┌───▼──────┐
│ zk-    │ │ message-   │  │ polkadot │
│ core   │ │ port       │  │ libraries│
└────────┘ └────────────┘  └──────────┘
```
> To find more about the Project Arch, please refer to [KZero Wallet SDK - Technical Documentation](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/kzero-wallet-sdk.md)
## Quick Start

### Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

**Start package development (watch mode):**
```bash
pnpm dev
```

**Start wallet application (port 5176):**
```bash
pnpm dev:wallet
```

**Start playground example (port 5175):**
```bash
pnpm dev:playground
```

**Start everything:**
```bash
pnpm dev:all
```

### Integration Example

```tsx
import { KzeroProvider, useKzero } from '@kzero/zk-react';

function App() {
  return (
    <KzeroProvider
      walletUrl="http://localhost:5176"
      rpcUrl="ws://127.0.0.1:9944"
      authEndpoint="http://localhost:3000"
      displayMode="modal"
    >
      <YourDApp />
    </KzeroProvider>
  );
}

function YourDApp() {
  const { account, isConnected, connect, sendTransaction } = useKzero();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected: {account?.address}</p>
      <button onClick={() => sendTransaction(txPayload)}>
        Send Transaction
      </button>
    </div>
  );
}
```

See `apps/playground` for complete integration examples.

## Available Commands

### Build & Development
- `pnpm build` - Build all packages and applications
- `pnpm dev` - Start development mode for core packages
- `pnpm dev:wallet` - Start wallet application (port 5176)
- `pnpm dev:playground` - Start playground example (port 5175)
- `pnpm dev:all` - Start all services concurrently

### Testing & Quality
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Generate coverage reports
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Run TypeScript type checking
> To find more details about the testing, please check [kzero-wallet-test-guide.md](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/kzero-wallet-test-guide.md)
### Other
- `pnpm commit` - Create conventional commit with Commitizen

## Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript 5.9** - Type system
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling (Wallet)
- **Material-UI 6** - UI components (Playground)
- **TanStack Router** - File-based routing (Wallet)

### Blockchain
- **Polkadot API** - Blockchain interaction
- **@polkadot/util-crypto** - Cryptographic utilities

### Security & Encryption
- **@noble/ciphers** - XChaCha20-Poly1305 encryption
- **@noble/hashes** - PBKDF2 key derivation

### Testing & Quality
- **Vitest** - Test framework
- **@testing-library/react** - Component testing
- **ESLint 9** - Code linting
- **Husky** - Git hooks

### Build & Tooling
- **pnpm** - Package manager
- **Turbo** - Monorepo build system
- **Rollup** - Library bundling

## Package Documentation

Each package has its own detailed README:

- **[@kzero/zk-core](packages/zk-core/README.md)** - Core types and ZK proof utilities
- **[@kzero/message-port](packages/message-port/README.md)** - Type-safe iframe communication
- **[@kzero/zk-react](packages/zk-react/README.md)** - React integration SDK

## Application Documentation

- **[Wallet App](apps/wallet/README.md)** - Official wallet implementation
- **[Playground](apps/playground/README.md)** - SDK integration examples

## How It Works

### 1. Authentication Flow

```
User clicks OAuth provider
     ↓
Generate ephemeral keypair (Ed25519)
     ↓
Request auth URL from backend
     ↓
Open OAuth window → User authorizes
     ↓
Backend receives JWT → Generates ZK proof
     ↓
Wallet polls for proof status
     ↓
Derive zkAddress from proof
     ↓
User sets PIN → Encrypt keypair
     ↓
Account ready for signing
```

### 2. Communication Architecture

```
DApp (Parent Window)          Wallet (Iframe)
┌─────────────────┐           ┌─────────────────┐
│ BidirectionalPort│◄─Channel─►│ BidirectionalPort│
│ • request()     │           │ • request()     │
│ • emit()        │           │ • emit()        │
│ • on()          │           │ • on()          │
└─────────────────┘           └─────────────────┘
```

- **Request/Response**: Async operations (signing, account queries)
- **Events**: State updates (account changes, theme updates)
- **Type Safety**: Full TypeScript type inference across both sides

### 3. Transaction Signing

```
DApp sends sign request
     ↓
Wallet displays transaction details
     ↓
User enters PIN → Decrypt keypair
     ↓
Sign with ephemeralPrivateKey
     ↓
Return { signature, signedTransaction }
     ↓
DApp submits to blockchain
```

## Security Features

- **Zero-Knowledge Proofs** - OAuth JWT never exposed to DApp
- **Ephemeral Keypairs** - Temporary keys for each session
- **PIN Encryption** - PBKDF2 (100k iterations) + XChaCha20-Poly1305
- **Origin Verification** - All postMessage calls verify origin
- **Session Isolation** - Keys stored in sessionStorage (tab-scoped)

## Development Notes

### Building Packages

Packages must be built before running applications:

```bash
pnpm build
```

### Running Tests

Each package has its own test suite:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @kzero/message-port test

# Watch mode
pnpm test:watch
```

### Type Checking

```bash
# Check all packages
pnpm check-types

# Check specific package
pnpm --filter @kzero/zk-react check-types
```

## License

[GPL-3.0](LICENSE)

## Links

### Project

- **Repository**: [kzero-wallet](https://github.com/kzero-xyz/kzero-wallet)
- **Issues**: [Report a bug or request a feature](https://github.com/kzero-xyz/kzero-wallet/issues)

### Documentation

- **Kzero Wallet SDK - Technical Documentation**: [KZero Wallet SDK - Technical Documentation
](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/kzero-wallet-sdk.md)
- **Kzero Wallet Testing Guide**: [Testing Guide for Kzero Wallet SDK](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/kzero-wallet-test-guide.md)
- **KZero Article**: [Kzero Overview](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/kzero-article.md)
- **Docker Tutorial**: [Docker Tutorial: Running Kzero Full Stack Locally](https://github.com/kzero-xyz/kzero-grant-docs/blob/main/m4-docker-tutorial.md)

### Related Services
- **Kzero Service**: [Authentication Service](https://github.com/kzero-xyz/kzero-service/tree/feature/auth-server)
- **Kzero Service Docker**: [Docker Setup](https://github.com/kzero-xyz/kzero-service-docker)