# @kzero/zk-core

> Framework-agnostic core types and utilities for the Kzero wallet SDK.

## Overview

`@kzero/zk-core` provides foundational TypeScript types, constants, and utility functions used across the Kzero wallet ecosystem. It has no framework dependencies and can be used in any JavaScript/TypeScript environment.

## Installation

```bash
npm install @kzero/zk-core
# or
pnpm add @kzero/zk-core
# or
yarn add @kzero/zk-core
```

## Features

- **Complete Type System** - TypeScript types for accounts, proofs, messages, and Polkadot integration
- **ZK Proof Utilities** - Functions for fetching and polling zero-knowledge proofs
- **Logger Utility** - Configurable logging system for SDKs and applications
- **Framework Agnostic** - No React or other UI framework dependencies
- **Tree-Shakeable** - Import only what you need
- **Fully Typed** - 100% TypeScript with complete type definitions

## Core Concepts

### Zero-Knowledge Proof Flow

```
Generate ephemeral keypair
     ↓
Request OAuth auth URL
     ↓
User authorizes via OAuth
     ↓
Backend generates ZK proof
     ↓
Poll /proof endpoint
     ↓
Receive proof + zkAddress
```

The proof status progresses through:
- `waiting` → OAuth authorization pending
- `generating` → ZK proof being computed
- `generated` → Proof ready (includes proof data and zkAddress)
- `failed` → Proof generation failed

## API Reference

### Core Types

#### `Hex`
Type alias for hexadecimal strings with `0x` prefix.

```typescript
type Hex = `0x${string}`;
```

#### `LoginProvider`
Supported OAuth authentication providers.

```typescript
type LoginProvider = 'google' | 'twitter' | 'apple' | 'github' | 'telegram' | 'discord';
```

#### `ZkAccount`
Represents a zero-knowledge authenticated account.

```typescript
type ZkAccount = {
  type: 'zk';
  address: Hex;
  provider: LoginProvider;
  ephemeralPublicKey: Hex;
  name: string;
  email?: string;
  picture?: string;
  proofStatus: 'pending' | 'error' | 'generated';
};
```

#### `Proof`
Zero-knowledge proof object returned from authentication service.

```typescript
type Proof = {
  updatedAt: number;
  createdAt: number;
  maxEpoch: string;
  kid: number;
  email?: string;
  name: string;
  picture?: string;
  provider: LoginProvider;
} & (
  | { status: 'waiting' | 'generating'; zkAddress: Hex }
  | {
      status: 'generated';
      proof: {
        proof_points: { a: [...], b: [...], c: [...] };
        iss_base64_details: { value: string; index_mod_4: number };
        header: string;
      };
      public: [`${number}`];
      zkAddress: Hex;
    }
  | { status: 'failed'; zkAddress?: Hex }
);
```

#### `ThemeConfig`
Theme configuration for wallet UI customization.

```typescript
interface ThemeConfig {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    success: string;
    successForeground: string;
    error: string;
    errorForeground: string;
    warning: string;
    warningForeground: string;
    border: string;
    divider: string;
  };
  radius: {
    base: string;
    card: string;
  };
}
```

#### `SignerPayloadJSON`
Polkadot extrinsic payload for signing transactions.

```typescript
interface SignerPayloadJSON {
  address: string;
  method: string;
  nonce?: Hex;
  tip?: Hex;
  era?: Hex;
  blockHash?: Hex;
  genesisHash?: Hex;
  specVersion?: Hex;
  transactionVersion?: Hex;
  signedExtensions?: string[];
  withSignedTransaction?: boolean;
  // ... additional fields
}
```

#### `SignerResult`
Result of signing an extrinsic.

```typescript
interface SignerResult {
  id: string;
  signature: Hex;
  signedTransaction: Hex;
}
```

#### `MessageData`
Discriminated union of all iframe communication message types.

```typescript
type MessageData = { id: string; error?: string } & (
  | { type: 'accounts.all'; payload: null; response: { accounts: ZkAccount[] } }
  | { type: 'logout'; payload: null; response: null }
  | { type: 'sign.request'; payload: SignerPayloadJSON; response: SignerResult }
  | { type: 'accounts.change'; payload: ZkAccount | null; response: null }
  | { type: 'theme.update'; payload: ThemeConfig; response: null }
  // ... other message types
);
```

### Functions

#### `getProof(baseAuthUrl, ephemeralPublicKey): Promise<Proof>`

Fetches a zero-knowledge proof from the authentication service.

**Parameters:**
- `baseAuthUrl` (string) - Base URL of the authentication service (e.g., `'https://auth.kzero.xyz'`)
- `ephemeralPublicKey` (Hex) - The ephemeral Ed25519 public key

**Returns:** `Promise<Proof>` - Proof object with current status

**Throws:** Error if the HTTP request fails or returns non-200 status

**Example:**
```typescript
import { getProof } from '@kzero/zk-core';

const proof = await getProof('https://auth.kzero.xyz', '0x1234...');

if (proof.status === 'generated') {
  console.log('Proof ready:', proof.proof);
  console.log('ZK Address:', proof.zkAddress);
} else if (proof.status === 'waiting' || proof.status === 'generating') {
  // Poll again after delay
  setTimeout(() => getProof(...), 3000);
} else if (proof.status === 'failed') {
  console.error('Proof generation failed');
}
```

#### `Logger` Class

Configurable logging utility for modules.

**Constructor:**
```typescript
new Logger(module: string, options?: LoggerOptions)
```

**Options:**
```typescript
interface LoggerOptions {
  enabled?: boolean;  // Enable debug/info logs (default: false)
  level?: 'debug' | 'info' | 'warn' | 'error';  // Minimum level (default: 'debug')
}
```

**Methods:**
- `debug(...args)` - Debug level log (only when enabled)
- `info(...args)` - Info level log (only when enabled)
- `warn(...args)` - Warning log (respects level config)
- `error(...args)` - Error log (respects level config)
- `configure(options)` - Update logger configuration

**Example:**
```typescript
import { Logger } from '@kzero/zk-core';

// SDK usage (disabled by default)
const log = new Logger('MyModule');
log.debug('This will not show');  // Silent by default

// App usage with environment detection
const isDev = import.meta.env.DEV;
const appLog = new Logger('MyApp', {
  enabled: isDev,
  level: isDev ? 'debug' : 'warn'
});

appLog.debug('Debug info');      // Shows in dev only
appLog.warn('Warning');           // Shows always
appLog.error('Error', error);     // Shows always

// Runtime configuration
log.configure({ enabled: true, level: 'warn' });
```

### Constants

#### `INJECTED_PROVIDER_NAME`

The provider name used for Polkadot extension compatibility.

```typescript
import { INJECTED_PROVIDER_NAME } from '@kzero/zk-core/constants';

console.log(INJECTED_PROVIDER_NAME); // '@kzero/zk-wallet'
```

## Usage Examples

### Basic Type Usage

```typescript
import type { ZkAccount, LoginProvider, Hex } from '@kzero/zk-core';

// Type-safe account handling
const account: ZkAccount = {
  type: 'zk',
  address: '0x1234...',
  provider: 'google',
  ephemeralPublicKey: '0xabcd...',
  name: 'Alice',
  email: 'alice@example.com',
  proofStatus: 'generated'
};

// Type-safe provider selection
const providers: LoginProvider[] = ['google', 'twitter', 'github'];
```

### Polling for Proof

```typescript
import { getProof, Logger } from '@kzero/zk-core';
import type { Proof } from '@kzero/zk-core';

const log = new Logger('ProofPoller', { enabled: true });

async function pollForProof(
  authUrl: string,
  ephemeralPublicKey: string,
  maxAttempts = 60
): Promise<Proof> {
  for (let i = 0; i < maxAttempts; i++) {
    const proof = await getProof(authUrl, ephemeralPublicKey);

    log.debug('Proof status:', proof.status);

    if (proof.status === 'generated') {
      log.info('Proof generated successfully');
      return proof;
    }

    if (proof.status === 'failed') {
      throw new Error('Proof generation failed');
    }

    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Proof polling timeout');
}
```

### Message Type Safety

```typescript
import type { MessageData } from '@kzero/zk-core';

// Type-safe message handling
function handleMessage(data: MessageData) {
  switch (data.type) {
    case 'accounts.all':
      // TypeScript knows payload is null and response is { accounts: ZkAccount[] }
      console.log('Requesting accounts');
      break;

    case 'sign.request':
      // TypeScript knows payload is SignerPayloadJSON
      console.log('Signing transaction for:', data.payload.address);
      break;

    case 'accounts.change':
      // TypeScript knows payload is ZkAccount | null
      if (data.payload) {
        console.log('Account changed:', data.payload.address);
      }
      break;
  }
}
```

## Package Exports

```json
{
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  },
  "./constants": {
    "import": "./dist/constants.js",
    "types": "./dist/constants.d.ts"
  }
}
```

## TypeScript

This package is written in TypeScript and includes complete type definitions. No `@types/*` package needed.

## Related Packages

- **[@kzero/message-port](../message-port)** - Type-safe iframe communication library
- **[@kzero/zk-react](../zk-react)** - React integration SDK

## License

[GPL-3.0](../../LICENSE)

## Repository

https://github.com/kzero-xyz/kzero-wallet
