# @kzero/zk-react

> React SDK for integrating Kzero zero-knowledge wallet into your DApp.

## Overview

`@kzero/zk-react` provides a complete React integration for building DApps with Kzero wallet support. It includes a Provider component, hooks for wallet interaction, and pre-built UI components with theme customization.

## Features

- **KzeroProvider** - Context provider managing wallet connection and iframe lifecycle
- **useKzero Hook** - Simple hook for all wallet operations
- **WalletCard Component** - Pre-built wallet UI with connect/disconnect functionality
- **Dynamic Theming** - Customizable themes with light/dark presets
- **Display Modes** - Modal popup or embedded iframe modes
- **Type-Safe** - Full TypeScript support with automatic type inference
- **Polkadot Compatible** - Works with Polkadot.js extension API

## Installation

```bash
npm install @kzero/zk-react
# or
pnpm add @kzero/zk-react
# or
yarn add @kzero/zk-react
```

**Peer Dependencies:**
```bash
npm install react@">=18"
```

## Quick Start

### 1. Wrap Your App with KzeroProvider

```typescript
import { KzeroProvider } from '@kzero/zk-react';

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
```

### 2. Use useKzero Hook

```typescript
import { useKzero } from '@kzero/zk-react';

function WalletButton() {
  const { account, isConnected, connect, disconnect } = useKzero();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected: {account?.address}</p>
      <p>Provider: {account?.provider}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### 3. Send Transactions

```typescript
import { useKzero } from '@kzero/zk-react';
import type { SignerPayloadJSON } from '@kzero/zk-core';

function TransferButton() {
  const { sendTransaction, account } = useKzero();

  const handleTransfer = async () => {
    const payload: SignerPayloadJSON = {
      address: account!.address,
      method: '0x...',
      // ... other transaction fields
    };

    try {
      const result = await sendTransaction(payload);
      console.log('Transaction signed:', result.signature);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return <button onClick={handleTransfer}>Send Transaction</button>;
}
```

## API Reference

### KzeroProvider

Main context provider that manages wallet connection and state.

**Props:**

```typescript
interface KzeroProviderProps {
  /**
   * URL of the wallet iframe
   * @example 'http://localhost:5176' (development)
   * @example 'https://wallet.kzero.xyz' (production)
   */
  walletUrl: string;

  /**
   * Polkadot blockchain RPC endpoint
   * @example 'ws://127.0.0.1:9944'
   */
  rpcUrl: string;

  /**
   * Authentication service endpoint
   * @example 'http://localhost:3000'
   */
  authEndpoint: string;

  /**
   * Display mode for wallet UI
   * - 'modal': Wallet appears as a modal popup (default)
   * - 'embedded': Wallet is embedded in the page
   * @default 'modal'
   */
  displayMode?: 'modal' | 'embedded';

  /**
   * Custom theme configuration
   */
  theme?: ThemeConfig;

  /**
   * Enabled OAuth providers
   * @default ['google', 'twitter', 'apple', 'github', 'telegram', 'discord']
   */
  providers?: LoginProvider[];

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback when wallet connects
   */
  onConnect?: () => void;

  /**
   * Callback when wallet disconnects
   */
  onDisconnect?: () => void;

  /**
   * React children
   */
  children: React.ReactNode;
}
```

**Example:**

```typescript
<KzeroProvider
  walletUrl="http://localhost:5176"
  rpcUrl="ws://127.0.0.1:9944"
  authEndpoint="http://localhost:3000"
  displayMode="modal"
  theme={darkTheme}
  providers={['google', 'twitter', 'github']}
  debug={true}
  onConnect={() => console.log('Connected!')}
  onDisconnect={() => console.log('Disconnected')}
>
  <App />
</KzeroProvider>
```

### useKzero Hook

Main hook for interacting with the wallet.

**Returns:**

```typescript
interface UseKzeroReturn {
  /**
   * All connected accounts
   */
  accounts: ZkAccount[];

  /**
   * Currently selected account
   */
  account: ZkAccount | null;

  /**
   * Whether wallet is connected
   */
  isConnected: boolean;

  /**
   * Show wallet UI (triggers connect flow)
   */
  connect: () => Promise<void>;

  /**
   * Disconnect from wallet
   */
  disconnect: () => Promise<void>;

  /**
   * Switch to a different account
   */
  switchAccount: (address: string) => Promise<void>;

  /**
   * Sign a message (not supported yet)
   */
  signMessage: (message: string) => Promise<string>;

  /**
   * Send transaction for signing
   */
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResponse>;

  /**
   * Show wallet UI
   */
  showWallet: () => void;

  /**
   * Hide wallet UI
   */
  hideWallet: () => void;
}
```

**Example:**

```typescript
function MyComponent() {
  const {
    account,
    accounts,
    isConnected,
    connect,
    disconnect,
    switchAccount,
    sendTransaction,
    showWallet,
    hideWallet
  } = useKzero();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Account: {account?.address}</p>
          <p>Provider: {account?.provider}</p>

          {/* Switch account if multiple accounts */}
          {accounts.length > 1 && (
            <select onChange={(e) => switchAccount(e.target.value)}>
              {accounts.map((acc) => (
                <option key={acc.address} value={acc.address}>
                  {acc.name || acc.address}
                </option>
              ))}
            </select>
          )}

          <button onClick={disconnect}>Disconnect</button>
          <button onClick={showWallet}>Show Wallet</button>
        </div>
      )}
    </div>
  );
}
```

### WalletCard Component

Pre-built wallet UI component with connect/disconnect functionality.

**Usage:**

```typescript
import { WalletCard } from '@kzero/zk-react';

function App() {
  return (
    <KzeroProvider {...providerProps}>
      <WalletCard />
    </KzeroProvider>
  );
}
```

The `WalletCard` component automatically:
- Shows connection status
- Displays connect button when disconnected
- Shows account info when connected
- Provides disconnect functionality
- Respects the current theme

## Display Modes

### Modal Mode (Default)

Wallet appears as a modal popup that overlays the page.

```typescript
<KzeroProvider displayMode="modal" {...otherProps}>
  <App />
</KzeroProvider>
```

**Benefits:**
- Non-intrusive - doesn't affect page layout
- Appears on-demand when needed
- Automatically centers on screen
- Backdrop dims background

### Embedded Mode

Wallet iframe is embedded directly in your page layout.

```typescript
<KzeroProvider displayMode="embedded" {...otherProps}>
  <div style={{ display: 'flex' }}>
    <div style={{ flex: 1 }}>
      <YourContent />
    </div>
    <div style={{ width: '400px' }}>
      <WalletCard /> {/* Wallet appears here */}
    </div>
  </div>
</KzeroProvider>
```

**Benefits:**
- Always visible - part of page layout
- Full control over positioning
- Better for wallet-focused apps
- Customizable container styling

## Theme System

### Predefined Themes

```typescript
import { KzeroProvider, lightTheme, darkTheme } from '@kzero/zk-react';

// Light theme
<KzeroProvider theme={lightTheme} {...otherProps}>
  <App />
</KzeroProvider>

// Dark theme
<KzeroProvider theme={darkTheme} {...otherProps}>
  <App />
</KzeroProvider>
```

### Custom Theme

```typescript
import type { ThemeConfig } from '@kzero/zk-core';

const customTheme: ThemeConfig = {
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    primary: '#6366f1',
    primaryForeground: '#ffffff',
    secondary: 'rgba(99, 102, 241, 0.1)',
    secondaryForeground: '#6366f1',
    success: '#10b981',
    successForeground: '#ffffff',
    error: '#ef4444',
    errorForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    border: '#333333',
    divider: 'rgba(51, 51, 51, 0.5)'
  },
  radius: {
    base: '8px',
    card: '16px'
  }
};

<KzeroProvider theme={customTheme} {...otherProps}>
  <App />
</KzeroProvider>
```

### Dynamic Theme Updates

Themes update in real-time without reloading the iframe:

```typescript
import { useState } from 'react';
import { KzeroProvider, lightTheme, darkTheme } from '@kzero/zk-react';

function App() {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <KzeroProvider theme={theme} {...otherProps}>
      <button onClick={() => setTheme(theme === lightTheme ? darkTheme : lightTheme)}>
        Toggle Theme
      </button>
      <YourApp />
    </KzeroProvider>
  );
}
```

**How it works:**

1. **Initial Load**: Theme passed via URL parameter when iframe loads
   - Preset themes: `?theme=light` or `?theme=dark`
   - Custom themes: `?theme=<encoded-json>`

2. **Runtime Updates**: Theme changes sent via `postMessage`
   - Uses `theme.update` event for efficient updates
   - No iframe reload required
   - Instant visual feedback

3. **Application**: Wallet applies theme using CSS variables
   ```css
   :root {
     --background: #ffffff;
     --foreground: #000000;
     --primary: #5328e7;
     /* ... etc */
   }
   ```

## Provider Configuration

### OAuth Providers

Control which OAuth providers are available:

```typescript
<KzeroProvider
  providers={['google', 'twitter', 'github']}
  {...otherProps}
>
  <App />
</KzeroProvider>
```

**Available providers:**
- `'google'` - Google OAuth
- `'twitter'` - Twitter OAuth
- `'apple'` - Apple Sign In
- `'github'` - GitHub OAuth
- `'telegram'` - Telegram Login
- `'discord'` - Discord OAuth

**Dynamic updates:**
```typescript
const [providers, setProviders] = useState<LoginProvider[]>(['google']);

// Add more providers at runtime
setProviders(['google', 'twitter', 'github']);
```

## Transaction Signing

### Basic Transaction

```typescript
import { useKzero } from '@kzero/zk-react';
import type { SignerPayloadJSON } from '@kzero/zk-core';

function SendTransaction() {
  const { sendTransaction, account } = useKzero();

  const handleSend = async () => {
    if (!account) return;

    const payload: SignerPayloadJSON = {
      address: account.address,
      method: '0x...',           // Encoded call data
      nonce: '0x00',
      era: '0x00',
      blockHash: '0x...',
      genesisHash: '0x...',
      specVersion: '0x...',
      transactionVersion: '0x...',
      withSignedTransaction: true
    };

    try {
      const result = await sendTransaction(payload);
      console.log('Signature:', result.signature);
      console.log('Signed Transaction:', result.signedTransaction);

      // Submit to blockchain
      // await api.rpc.author.submitExtrinsic(result.signedTransaction);
    } catch (error) {
      console.error('Failed to sign:', error);
    }
  };

  return <button onClick={handleSend}>Send</button>;
}
```

### With Polkadot API

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useKzero } from '@kzero/zk-react';

function PolkadotTransfer() {
  const { sendTransaction, account } = useKzero();

  const handleTransfer = async () => {
    if (!account) return;

    // Connect to blockchain
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    // Create transfer extrinsic
    const transfer = api.tx.balances.transferKeepAlive(
      'RECIPIENT_ADDRESS',
      1000000000000 // Amount in planck
    );

    // Get payload
    const payload = transfer.toJSON();

    // Sign via wallet
    const result = await sendTransaction(payload);

    // Submit signed transaction
    const hash = await api.rpc.author.submitExtrinsic(result.signedTransaction);

    console.log('Transaction hash:', hash.toHex());
  };

  return <button onClick={handleTransfer}>Transfer</button>;
}
```

## Error Handling

```typescript
import { useKzero, ConnectionError, TransactionError } from '@kzero/zk-react';

function MyComponent() {
  const { connect, sendTransaction } = useKzero();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      if (error instanceof ConnectionError) {
        console.error('Connection failed:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  const handleTransaction = async () => {
    try {
      await sendTransaction(payload);
    } catch (error) {
      if (error instanceof TransactionError) {
        console.error('Transaction failed:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  return <div>...</div>;
}
```

## TypeScript Types

### ZkAccount

```typescript
interface ZkAccount {
  type: 'zk';
  address: string;
  provider: LoginProvider;
  ephemeralPublicKey: string;
  name: string;
  email?: string;
  picture?: string;
  proofStatus: 'pending' | 'error' | 'generated';
}
```

### TransactionRequest

```typescript
type TransactionRequest = SignerPayloadJSON; // From @kzero/zk-core
```

### TransactionResponse

```typescript
interface TransactionResponse {
  id: string;
  signature: string;
  signedTransaction: string;
}
```

## Advanced Usage

### Multiple Account Management

```typescript
function AccountSwitcher() {
  const { accounts, account, switchAccount } = useKzero();

  return (
    <div>
      <h3>Current Account:</h3>
      <p>{account?.name || account?.address}</p>

      {accounts.length > 1 && (
        <>
          <h4>Switch to:</h4>
          {accounts
            .filter((acc) => acc.address !== account?.address)
            .map((acc) => (
              <button key={acc.address} onClick={() => switchAccount(acc.address)}>
                {acc.name || acc.address}
              </button>
            ))}
        </>
      )}
    </div>
  );
}
```

### Custom Wallet UI

```typescript
function CustomWalletUI() {
  const { isConnected, account, connect, disconnect, showWallet, hideWallet } = useKzero();

  if (!isConnected) {
    return (
      <div className="my-wallet">
        <button onClick={connect} className="connect-btn">
          Connect Your Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="my-wallet">
      <div className="account-info">
        <img src={account?.picture} alt={account?.name} />
        <div>
          <p className="name">{account?.name}</p>
          <p className="address">{account?.address}</p>
        </div>
      </div>
      <button onClick={showWallet}>Open Wallet</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## Polkadot Extension Compatibility

Kzero wallet can be used with any DApp that supports Polkadot.js extension:

```typescript
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

// Enable Kzero wallet (along with other extensions)
await web3Enable('My DApp');

// Get all accounts (including Kzero accounts)
const allAccounts = await web3Accounts();

// Kzero accounts will have source: '@kzero/zk-wallet'
const kzeroAccounts = allAccounts.filter((acc) => acc.meta.source === '@kzero/zk-wallet');
```

## Security Considerations

1. **HTTPS Required**: Always use HTTPS in production for `walletUrl`
2. **Origin Validation**: All iframe communication validates origins
3. **Ephemeral Keys**: Keys are temporary and scoped to sessions
4. **PIN Encryption**: User PINs encrypt sensitive data locally
5. **Timeout**: All requests timeout after 60 seconds

## Troubleshooting

### Wallet Not Connecting

**Check:**
1. `walletUrl` is correct and accessible
2. `rpcUrl` is valid and reachable
3. `authEndpoint` is running and accessible
4. Browser console for errors

**Solution:**
```typescript
<KzeroProvider
  debug={true}  // Enable debug logging
  {...otherProps}
>
  <App />
</KzeroProvider>
```

### Theme Not Applying

**Problem:** Custom theme not reflected in wallet UI

**Solution:**
1. Ensure theme object matches `ThemeConfig` interface
2. Check browser console for errors
3. Verify iframe has loaded (check network tab)

### Transaction Signing Fails

**Problem:** `sendTransaction` throws error

**Common causes:**
1. Account not connected
2. Invalid transaction payload
3. User rejected transaction
4. Network issues

**Solution:**
```typescript
const handleTransaction = async () => {
  if (!account) {
    console.error('No account connected');
    return;
  }

  try {
    const result = await sendTransaction(payload);
    console.log('Success:', result);
  } catch (error) {
    if (error.message.includes('User rejected')) {
      console.log('User cancelled transaction');
    } else {
      console.error('Transaction error:', error);
    }
  }
};
```

## Package Exports

```json
{
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
}
```

## TypeScript

This package includes complete TypeScript type definitions. No `@types/*` package needed.

## License

[GPL-3.0](../../LICENSE)

## Related Packages

- **[@kzero/zk-core](../zk-core)** - Core types and utilities
- **[@kzero/message-port](../message-port)** - Type-safe iframe communication

## Repository

https://github.com/kzero-xyz/kzero-wallet

## Examples

See **[apps/playground](../../apps/playground)** for a complete example with:
- Theme customization
- Provider selection
- Transaction sending
- Account management
