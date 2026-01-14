# Kzero Wallet Application

> Official wallet UI that runs as an iframe for zero-knowledge based authentication and transaction signing.

## Overview

The Kzero wallet is a React application that provides the user interface for OAuth authentication, account management, and transaction signing. It runs as an iframe embedded in DApps and communicates with the parent window using the `@kzero/message-port` library.

## Features

- **OAuth Authentication** - Support for Google, Twitter, Apple, GitHub, Telegram, and Discord
- **Zero-Knowledge Proofs** - Privacy-preserving authentication without exposing JWT tokens
- **Transaction Signing** - Sign Polkadot extrinsics with ephemeral keypairs
- **PIN Encryption** - Secure local encryption of private keys with user PIN
- **Session Management** - Automatic session state management with encrypted storage
- **Dynamic Theming** - Support for custom themes via URL parameters and postMessage
- **Multi-Provider** - Dynamic OAuth provider configuration
- **Modal & Embedded Modes** - Support for both display modes

## Technology Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type system
- **TanStack Router** - File-based routing
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **Polkadot API** - Blockchain interaction
- **@noble/ciphers** - XChaCha20-Poly1305 encryption
- **@noble/hashes** - PBKDF2 key derivation
- **Vite 7** - Build tool

## Development

### Prerequisites

- Node.js >= 20
- pnpm
- Running authentication service (for ZK proof generation)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Blockchain RPC endpoint
VITE_WS_ENDPOINT=ws://127.0.0.1:9944

# Authentication service endpoint
VITE_AUTH_ENDPOINT=http://localhost:3000
```

### Install Dependencies

```bash
# From the workspace root
pnpm install
```

### Start Development Server

```bash
# From the workspace root
pnpm dev:wallet

# Or directly in this directory
pnpm dev
```

The wallet will start on **http://localhost:5176**

### Build

```bash
# From the workspace root
pnpm --filter @kzero/wallet build

# Or directly in this directory
pnpm build
```

### Type Checking

```bash
# From the workspace root
pnpm --filter @kzero/wallet check-types

# Or directly in this directory
pnpm check-types
```

## Project Structure

```
apps/wallet/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── routes/               # TanStack Router routes
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Home page
│   │   └── app/              # App routes
│   ├── card/                 # Wallet UI cards
│   │   ├── Welcome.tsx       # Provider selection
│   │   ├── Connecting.tsx    # OAuth connection status
│   │   ├── SecurityCheck.tsx # PIN setup
│   │   ├── LoginSuccess.tsx  # Success state
│   │   ├── LoginFailed.tsx   # Error state
│   │   ├── SignExtrinsic.tsx # Transaction signing
│   │   └── Forget.tsx        # Account removal
│   ├── lib/                  # Core logic
│   │   ├── messageHandler.ts     # Parent window communication
│   │   ├── sessionManager.ts     # Session state management
│   │   ├── authService.ts        # OAuth and proof fetching
│   │   ├── encryptionUtils.ts    # PIN encryption
│   │   ├── proofPollingService.ts # Background proof polling
│   │   └── authWindowManager.ts  # OAuth popup management
│   ├── hooks/                # React hooks
│   ├── components/           # Reusable UI components
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Core Modules

### MessageHandler

Handles bidirectional communication with parent DApp.

**Responsibilities:**
- Handle `accounts.all` requests - Return connected accounts
- Handle `logout` requests - Clear session and disconnect
- Handle `sign.request` - Show transaction signing UI
- Handle `sign.cancelled` events - Close signing UI
- Handle `theme.update` events - Apply new theme
- Handle `providers.update` events - Update available OAuth providers
- Emit `accounts.change` events - Notify parent of account changes

### SessionManager

Manages ephemeral keypair and proof lifecycle.

**State Machine:**
```
idle → initialized → authenticated → encrypted → active
```

**Responsibilities:**
- Generate Ed25519 ephemeral keypairs
- Store proof after OAuth authentication
- Encrypt keypair with PIN using XChaCha20-Poly1305
- Decrypt keypair for signing
- Persist encrypted data in sessionStorage
- Terminate session on logout

### AuthService

Manages OAuth authentication and proof fetching.

**Responsibilities:**
- Request OAuth URLs from backend
- Poll proof status (`waiting → generating → generated/failed`)
- Return zkAddress and proof data

### EncryptionUtils

Provides PIN-based encryption/decryption.

**Implementation:**
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Encryption**: XChaCha20-Poly1305 (AEAD)
- **Salt**: Random 16 bytes per encryption
- **Nonce**: Random 24 bytes per encryption

### ProofPollingService

Background service for polling proof status.

**Behavior:**
- Polls every 5 seconds
- Stops when proof status is `generated` or `failed`
- Updates session with latest proof data

## URL Parameters

The wallet accepts the following URL parameters:

### `mode`

Display mode for the wallet UI.

- **Values**: `modal` | `embedded`
- **Default**: `modal`
- **Example**: `?mode=embedded`

### `theme`

Initial theme configuration.

- **Preset themes**: `light` | `dark`
- **Custom theme**: URL-encoded JSON
- **Example**: `?theme=dark`
- **Example**: `?theme=%7B%22colors%22%3A...%7D`

### `providers`

Comma-separated list of enabled OAuth providers.

- **Example**: `?providers=google,twitter,github`
- **Default**: All providers enabled

### `debug`

Enable debug logging.

- **Values**: `true` | `false`
- **Default**: `false`
- **Example**: `?debug=true`

## OAuth Authentication Flow

```
1. User clicks OAuth provider (e.g., Google)
   ├─ SessionManager.initialize() - Generate ephemeral keypair
   └─ AuthService.getAuthUrl() - Request OAuth URL from backend

2. Wallet requests parent to open OAuth window
   ├─ Emit 'auth.request' event with authUrl
   └─ Parent opens popup window

3. User authorizes in OAuth popup
   ├─ Backend receives JWT token
   ├─ Backend generates ZK proof
   └─ OAuth popup closes

4. Parent notifies wallet of closed popup
   ├─ Parent emits 'auth.window-closed' event
   └─ Wallet checks auth status

5. Wallet polls for proof
   ├─ ProofPollingService polls every 5 seconds
   ├─ Status: waiting → generating → generated
   └─ SessionManager.authenticate(proof)

6. User sets PIN
   ├─ SessionManager.encrypt(pin)
   ├─ Keypair encrypted with XChaCha20-Poly1305
   └─ Stored in sessionStorage

7. Account ready
   ├─ Emit 'accounts.change' to parent
   └─ User can sign transactions
```

## Transaction Signing Flow

```
1. Parent sends 'sign.request'
   ├─ SignExtrinsic card displays
   └─ Shows transaction details

2. User reviews and confirms
   ├─ Enters PIN to decrypt keypair
   └─ Signs with ephemeralPrivateKey

3. Wallet returns signature
   ├─ Returns { id, signature, signedTransaction }
   └─ Parent submits to blockchain
```

## Theme System

Themes are applied using CSS custom properties:

```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #5328e7;
  --primary-foreground: #ffffff;
  --secondary: rgba(83, 40, 231, 0.1);
  --secondary-foreground: #5328e7;
  --success: #10b981;
  --success-foreground: #ffffff;
  --error: #ef4444;
  --error-foreground: #ffffff;
  --warning: #f59e0b;
  --warning-foreground: #ffffff;
  --border: #e5e7eb;
  --divider: rgba(229, 231, 235, 0.5);
  --radius-base: 10px;
  --radius-card: 20px;
}
```

**Theme Updates:**

1. **Initial Load**: Parse `theme` URL parameter
2. **Runtime Updates**: Listen to `theme.update` postMessage events
3. **Application**: Update CSS variables dynamically

## Security Features

### Key Management

- **Ephemeral Keypairs**: Generated per session, not stored persistently
- **PIN Encryption**: PBKDF2 (100k iterations) + XChaCha20-Poly1305
- **Session Scoped**: Keys stored in sessionStorage (tab-scoped, not persistent)
- **Auto Cleanup**: Keys cleared on logout or tab close

### Communication Security

- **Origin Validation**: All postMessage calls validate origin
- **MessagePort Isolation**: Dedicated channel per connection
- **Type-Safe Messages**: Discriminated union types prevent message spoofing

### OAuth Security

- **No JWT Storage**: JWT never leaves backend
- **ZK Proofs**: Privacy-preserving identity verification
- **Ephemeral Association**: Proof tied to ephemeral public key

## Development Tips

### Debug Mode

Enable debug logging in development:

```
http://localhost:5176?debug=true
```

Or set in DApp:

```typescript
<KzeroProvider debug={true} {...props}>
  <App />
</KzeroProvider>
```

### Testing Themes

Test themes using URL parameters:

```
# Light theme
http://localhost:5176?theme=light

# Dark theme
http://localhost:5176?theme=dark

# Custom theme
http://localhost:5176?theme=%7B%22colors%22%3A%7B...%7D%7D
```

### Testing Providers

Test with specific OAuth providers:

```
http://localhost:5176?providers=google,twitter
```

## Troubleshooting

### OAuth Window Not Opening

**Problem:** Parent DApp doesn't open OAuth popup

**Solution:**
1. Ensure parent registered `auth.request` handler
2. Check browser popup blocker settings
3. Verify MessagePort connection is established

### Proof Polling Timeout

**Problem:** Proof status stuck at `waiting` or `generating`

**Solution:**
1. Check authentication service is running
2. Verify `VITE_AUTH_ENDPOINT` is correct
3. Check backend logs for proof generation errors

### Signing Fails

**Problem:** Transaction signing throws error

**Solution:**
1. Check keypair is decrypted (correct PIN)
2. Verify transaction payload format
3. Check browser console for detailed errors

### Theme Not Applying

**Problem:** Custom theme not visible

**Solution:**
1. Verify theme JSON format matches `ThemeConfig`
2. Check browser console for CSS variable errors
3. Ensure theme parameter is properly URL-encoded

## Building for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
```

## Deployment

The wallet application should be deployed to a static hosting service (Vercel, Netlify, Cloudflare Pages, etc.) with:

- HTTPS enabled (required for production)
- CORS headers configured for parent DApp origins
- Environment variables configured for production endpoints

## License

[GPL-3.0](../../LICENSE)

## Related

- **[Main README](../../README.md)** - Project overview
- **[Playground](../playground)** - SDK integration example
- **[@kzero/zk-react](../../packages/zk-react)** - React SDK
