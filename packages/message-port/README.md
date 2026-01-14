# @kzero/message-port

> Type-safe, symmetric bidirectional communication between parent windows and iframes using MessageChannel API.

## Overview

A lightweight TypeScript library for building **truly bidirectional** iframe communication with full type safety. Both parent and iframe have identical capabilities - either side can send requests, handle requests, emit events, and listen to events.

## Features

- **🔄 Truly Bidirectional** - Both sides have identical capabilities for requests and events
- **📝 Type-Safe** - Full TypeScript support with automatic type inference
- **✨ Promise-Based** - Modern async/await API for request-response patterns
- **📡 Event System** - Pub/sub pattern for fire-and-forget messages
- **🔒 Secure** - Origin validation, timeout handling, MessagePort isolation
- **🎯 Simple API** - Unified interface on both sides with DOM-compatible event listeners
- **⚡ Efficient** - MessageChannel for direct communication, no window.postMessage polling

## Installation

```bash
npm install @kzero/message-port
# or
pnpm add @kzero/message-port
# or
yarn add @kzero/message-port
```

## Architecture

```
┌──────────────────────┐       MessageChannel        ┌──────────────────────┐
│   Parent Window      │◄───────────────────────────►│   Iframe (Wallet)   │
│                      │                              │                      │
│  BidirectionalPort   │       port1 ↔ port2         │  BidirectionalPort   │
│                      │                              │                      │
│  • request() ────────┼──────► [handler]            │  • request() ────────┼──────► [handler]
│  • handle()          │                              │  • handle()          │
│  • emit() ───────────┼──────► [listener]           │  • emit() ───────────┼──────► [listener]
│  • on()              │                              │  • on()              │
└──────────────────────┘                              └──────────────────────┘
          │                                                    │
    Handshake Init                                       Handshake Ready
```

**Key Concepts:**

- **Request/Response** - Async operations with Promise-based responses
- **Events** - Fire-and-forget messages using pub/sub pattern
- **Symmetric API** - Both sides use the exact same API
- **MessageChannel** - Dedicated channel for isolated communication

## Quick Start

### 1. Define Your Message Types

```typescript
import type { BaseMessageData } from '@kzero/message-port';

// Define message types using discriminated union
type MyMessageData = { id: string; error?: string } & (
  | {
      type: 'get-balance';
      payload: { address: string };
      response: { balance: string };
    }
  | {
      type: 'sign-tx';
      payload: { transaction: string };
      response: { signature: string };
    }
  | {
      type: 'account-changed';
      payload: { address: string };
      response: null; // Events don't have responses
    }
);
```

### 2. Parent Window Setup

```typescript
import { createParentPort } from '@kzero/message-port';

const iframe = document.querySelector('iframe') as HTMLIFrameElement;

// Establish connection
const port = await createParentPort<MyMessageData>(
  iframe,
  'https://wallet.example.com', // Expected iframe origin
  { timeout: 30000, debug: true }
);

// Send requests to iframe
const balance = await port.request('get-balance', { address: '0x...' });
console.log('Balance:', balance.balance); // TypeScript knows the response type!

// Handle requests from iframe
port.handle('sign-tx', async ({ transaction }) => {
  const signature = await signTransaction(transaction);
  return { signature };
});

// Listen to events from iframe
port.on('account-changed', ({ address }) => {
  console.log('Account changed:', address);
});

// Emit events to iframe
port.emit('account-changed', { address: '0xnew...' });
```

### 3. Iframe Setup

```typescript
import { createIframePort } from '@kzero/message-port';

// Establish connection
const port = await createIframePort<MyMessageData>(
  'https://parent.example.com', // Expected parent origin
  { timeout: 30000, debug: true }
);

// Handle requests from parent
port.handle('get-balance', async ({ address }) => {
  const balance = await fetchBalance(address);
  return { balance };
});

// Send requests to parent
const result = await port.request('sign-tx', { transaction: '0x...' });
console.log('Signature:', result.signature);

// Listen to events from parent
port.on('account-changed', ({ address }) => {
  updateUI(address);
});

// Emit events to parent
port.emit('account-changed', { address: '0x...' });
```

## API Reference

### Factory Functions

#### `createParentPort<TMessageData>(iframe, targetOrigin, options?): Promise<BidirectionalPort>`

Create a BidirectionalPort on the parent window side.

**Parameters:**
- `iframe: HTMLIFrameElement` - The iframe element to communicate with
- `targetOrigin: string` - Expected origin of the iframe (for security)
- `options?: BidirectionalPortOptions` - Optional configuration

**Returns:** `Promise<BidirectionalPort<TMessageData>>` - Resolves when handshake completes

**Example:**
```typescript
const port = await createParentPort<MyMessageData>(
  iframeElement,
  'https://wallet.example.com',
  {
    timeout: 30000,
    debug: true,
    allowedOrigins: ['https://wallet.example.com']
  }
);
```

**Handshake Process:**
1. Parent creates MessageChannel
2. Parent sends HANDSHAKE_INIT via postMessage with port2
3. Iframe receives port2 and sends HANDSHAKE_READY
4. Parent receives ready signal
5. Connection established

#### `createIframePort<TMessageData>(expectedOrigin, options?): Promise<BidirectionalPort>`

Create a BidirectionalPort on the iframe side.

**Parameters:**
- `expectedOrigin: string` - Expected origin of the parent window (for security)
- `options?: BidirectionalPortOptions` - Optional configuration

**Returns:** `Promise<BidirectionalPort<TMessageData>>` - Resolves when handshake completes

**Example:**
```typescript
const port = await createIframePort<MyMessageData>(
  'https://parent.example.com',
  {
    timeout: 30000,
    debug: true
  }
);
```

### BidirectionalPort Class

#### `request<K>(type, payload): Promise<Response>`

Send a request and wait for response.

**Type Safety:** TypeScript automatically infers payload and response types based on the message type.

**Parameters:**
- `type: K` - Message type (inferred from TMessageData)
- `payload` - Message payload (type automatically inferred)

**Returns:** `Promise<Response>` - Response data (type automatically inferred)

**Throws:** Error on timeout or if handler throws

**Example:**
```typescript
// TypeScript knows payload must be { address: string }
const result = await port.request('get-balance', { address: '0x...' });
// TypeScript knows result is { balance: string }
console.log(result.balance);
```

#### `handle<K>(type, handler): void`

Register a handler for incoming requests.

**Type Safety:** Handler signature is automatically inferred from message types.

**Parameters:**
- `type: K` - Message type to handle
- `handler: (payload) => Promise<Response>` - Async handler function

**Example:**
```typescript
port.handle('get-balance', async ({ address }) => {
  //                             ^? { address: string } - auto-inferred!
  const balance = await fetchBalance(address);
  return { balance }; // Must match response type
});
```

**Error Handling:**
```typescript
port.handle('risky-operation', async (payload) => {
  if (!isValid(payload)) {
    throw new Error('Invalid payload'); // Error sent back to requester
  }
  return { result: 'success' };
});
```

#### `unhandle<K>(type): void`

Unregister a request handler.

**Example:**
```typescript
port.unhandle('get-balance');
```

#### `emit<K>(type, data): void`

Emit an event (fire-and-forget, no response expected).

**Parameters:**
- `type: K` - Event type
- `data` - Event data (type automatically inferred)

**Example:**
```typescript
port.emit('account-changed', { address: '0x...' });
```

#### `on<K>(type, listener): () => void`

Listen to events. Returns an unsubscribe function.

**Type Safety:** Listener data type is automatically inferred.

**Parameters:**
- `type: K` - Event type to listen to
- `listener: (data) => void` - Event listener function

**Returns:** `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = port.on('account-changed', ({ address }) => {
  //                                              ^? { address: string }
  console.log('Account:', address);
});

// Later: unsubscribe
unsubscribe();
```

#### `off<K>(type, listener?): void`

Remove event listener(s).

**Parameters:**
- `type: K` - Event type
- `listener?` - Specific listener to remove (omit to remove all)

**Example:**
```typescript
// Remove specific listener
port.off('account-changed', myListener);

// Remove all listeners for this type
port.off('account-changed');
```

#### `addEventListener<K>(type, listener): void`

DOM-style event listener API (alias for `on()`).

**Example:**
```typescript
port.addEventListener('account-changed', ({ address }) => {
  console.log(address);
});
```

#### `removeEventListener<K>(type, listener?): void`

DOM-style event listener removal (alias for `off()`).

**Example:**
```typescript
port.removeEventListener('account-changed', myListener);
```

#### `destroy(): void`

Clean up all resources and close the port.

**Example:**
```typescript
// React cleanup
useEffect(() => {
  const port = await createParentPort(iframe, origin);

  return () => {
    port.destroy(); // Clean up on unmount
  };
}, []);
```

### Configuration Options

```typescript
interface BidirectionalPortOptions {
  /**
   * Allowed origins for security validation
   * If not provided, accepts messages from any origin (not recommended for production)
   */
  allowedOrigins?: string[];

  /**
   * Default timeout for requests in milliseconds
   * @default 60000
   */
  timeout?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}
```

## Usage Examples

### Type-Safe Message Definition

```typescript
import type { BaseMessageData } from '@kzero/message-port';

// Option 1: Inline discriminated union
type WalletMessages = { id: string; error?: string } & (
  | {
      type: 'get-account';
      payload: { address?: string };
      response: { account: string; balance: number };
    }
  | {
      type: 'sign-message';
      payload: { message: string };
      response: { signature: string };
    }
  | {
      type: 'account-changed';
      payload: { address: string };
      response: null; // Events don't have responses
    }
);

// Option 2: Separate types for clarity
type GetAccountMessage = {
  type: 'get-account';
  payload: { address?: string };
  response: { account: string; balance: number };
};

type SignMessageMessage = {
  type: 'sign-message';
  payload: { message: string };
  response: { signature: string };
};

type AccountChangedEvent = {
  type: 'account-changed';
  payload: { address: string };
  response: null;
};

type WalletMessages = { id: string; error?: string } & (
  | GetAccountMessage
  | SignMessageMessage
  | AccountChangedEvent
);
```

### Error Handling

```typescript
try {
  const result = await port.request('sign-tx', { transaction: '0x...' });
  console.log('Signed:', result.signature);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Request timed out - wallet may be unresponsive');
  } else if (error.message.includes('No handler')) {
    console.error('Wallet is not ready to handle this request');
  } else {
    console.error('Request failed:', error.message);
  }
}
```

### Multiple Communication Channels

```typescript
// Different iframes can have different message types
const walletPort = await createParentPort<WalletMessages>(
  walletIframe,
  'https://wallet.example.com'
);

const analyticsPort = await createParentPort<AnalyticsMessages>(
  analyticsIframe,
  'https://analytics.example.com'
);

// Parallel requests
const [balance, events] = await Promise.all([
  walletPort.request('get-balance', { address: '0x...' }),
  analyticsPort.request('get-events', { userId: '123' })
]);
```

### Custom Timeouts

```typescript
// Short timeout for fast operations
const quickPort = await createParentPort(iframe, origin, {
  timeout: 5000
});

// Longer timeout for complex operations (like signing)
const signingPort = await createParentPort(iframe, origin, {
  timeout: 60000
});
```

### React Integration

```typescript
import { useEffect, useState } from 'react';
import { createParentPort, BidirectionalPort } from '@kzero/message-port';
import type { WalletMessages } from './types';

function useWallet(iframe: HTMLIFrameElement | null) {
  const [port, setPort] = useState<BidirectionalPort<WalletMessages> | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!iframe) return;

    let currentPort: BidirectionalPort<WalletMessages> | null = null;

    (async () => {
      currentPort = await createParentPort<WalletMessages>(
        iframe,
        'https://wallet.example.com',
        { debug: import.meta.env.DEV }
      );

      // Listen to account changes
      currentPort.on('account-changed', ({ address }) => {
        console.log('Account changed:', address);
      });

      setPort(currentPort);
    })();

    return () => {
      currentPort?.destroy();
    };
  }, [iframe]);

  const getBalance = async (address: string) => {
    if (!port) throw new Error('Port not initialized');
    const result = await port.request('get-balance', { address });
    setBalance(result.balance);
    return result.balance;
  };

  return { port, balance, getBalance };
}
```

## Security Best Practices

### 1. Always Validate Origins

**Production:**
```typescript
const port = await createParentPort(iframe, 'https://trusted-wallet.com', {
  allowedOrigins: ['https://trusted-wallet.com']
});
```

**Development:**
```typescript
const port = await createParentPort(iframe, 'http://localhost:3000', {
  allowedOrigins: ['http://localhost:3000'],
  debug: true
});
```

### 2. Use HTTPS in Production

```typescript
// ❌ BAD - Insecure
const port = await createParentPort(iframe, 'http://wallet.example.com');

// ✅ GOOD - Secure
const port = await createParentPort(iframe, 'https://wallet.example.com');
```

### 3. Validate Data in Handlers

```typescript
port.handle('transfer', async ({ amount, to }) => {
  // Validate input
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  if (!isValidAddress(to)) {
    throw new Error('Invalid recipient address');
  }

  return await executeTransfer(amount, to);
});
```

### 4. Set Reasonable Timeouts

```typescript
// Fast operations - short timeout
const port = await createParentPort(iframe, origin, { timeout: 5000 });

// User interactions - longer timeout
const port = await createParentPort(iframe, origin, { timeout: 60000 });
```

## Troubleshooting

### Handshake Timeout

**Problem:** `createParentPort` or `createIframePort` times out during connection.

**Solutions:**
1. Ensure iframe is fully loaded before calling `createParentPort`:
   ```typescript
   iframe.onload = async () => {
     const port = await createParentPort(iframe, origin);
   };
   ```

2. Check that origins match exactly (including protocol and port):
   ```typescript
   // ❌ Mismatch
   // Parent: 'https://example.com'
   // Iframe: 'https://example.com:443' // Will fail

   // ✅ Must match exactly
   // Both: 'https://example.com'
   ```

3. Verify both sides call factory functions
4. Increase timeout if network is slow

### No Handler Registered

**Problem:** Request fails with "No handler registered for: X"

**Solutions:**
1. Register handlers **before** sending requests:
   ```typescript
   // ✅ Correct order
   port.handle('get-balance', handler);
   await port.request('get-balance', { address: '0x...' });
   ```

2. Check message type spelling matches exactly
3. Verify handler is registered on the correct side

### TypeScript Errors

**Problem:** Type errors when using the library.

**Solutions:**
1. Ensure message data includes required fields:
   ```typescript
   type MyMessages = { id: string; error?: string } & ( // Required fields
     | { type: 'msg1'; payload: ...; response: ... }
   );
   ```

2. Use `response: null` for events:
   ```typescript
   | { type: 'my-event'; payload: ...; response: null }
   ```

3. Use discriminated union pattern for `type` field

## Comparison with window.postMessage

| Feature | @kzero/message-port | window.postMessage |
|---------|---------------------|-------------------|
| **Type Safety** | ✅ Full TypeScript support | ❌ Manual typing |
| **Bidirectional** | ✅ Both sides equal | ⚠️ Asymmetric |
| **Request/Response** | ✅ Built-in promises | ❌ Manual correlation |
| **Events** | ✅ Pub/sub pattern | ❌ Manual listeners |
| **Origin Validation** | ✅ Automatic | ⚠️ Manual checks |
| **Message Routing** | ✅ Type-based | ❌ Manual |
| **Security** | ✅ MessagePort isolation | ⚠️ Global window |
| **Performance** | ✅ Direct channel | ⚠️ Window polling |

## TypeScript Support

Complete type inference throughout the API:

```typescript
// TypeScript infers everything automatically
port.handle('get-balance', async ({ address }) => {
  //                             ^? { address: string } - inferred!
  return { balance: '100' };
  //     ^? { balance: string } - enforced by compiler
});

const result = await port.request('get-balance', { address: '0x...' });
//    ^? { balance: string } - automatically inferred!

port.on('account-changed', ({ address }) => {
  //                         ^? { address: string } - inferred!
});
```

## License

[GPL-3.0](../../LICENSE)

## Related Packages

- **[@kzero/zk-core](../zk-core)** - Core types and utilities
- **[@kzero/zk-react](../zk-react)** - React integration using this library

## Repository

https://github.com/kzero-xyz/kzero-wallet
