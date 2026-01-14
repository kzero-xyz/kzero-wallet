# Kzero Playground

> Interactive example application demonstrating SDK integration, theme customization, and wallet features.

## Overview

The playground is a demo React application that showcases how to integrate the Kzero wallet SDK into your DApp. It includes:

- Complete SDK integration example
- Interactive theme customization
- OAuth provider selection
- Transaction sending demo
- Account management demonstration
- Real-time preview of wallet UI

## Features

- **Theme Customization** - Live theme editing with light/dark presets and custom colors
- **Provider Selection** - Toggle OAuth providers on/off
- **Display Mode Toggle** - Switch between modal and embedded modes
- **Transaction Demo** - Send test transactions on Polkadot blockchain
- **Account Management** - View connected accounts and their details
- **Polkadot API Integration** - Full blockchain interaction examples

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type system
- **Material-UI 6** - UI component library
- **@kzero/zk-react** - Kzero wallet SDK
- **@polkadot/api** - Polkadot blockchain interaction
- **Vite 7** - Build tool

## Development

### Prerequisites

- Node.js >= 20
- pnpm
- Running wallet application (on port 5176)
- Running authentication service (for OAuth)
- Running Polkadot node (for transaction demos)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Wallet iframe URL
VITE_WALLET_URL=http://localhost:5176

# Blockchain RPC endpoint
VITE_RPC_URL=ws://127.0.0.1:9944

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
pnpm dev:playground

# Or directly in this directory
pnpm dev
```

The playground will start on **http://localhost:5175**

### Build

```bash
# From the workspace root
pnpm --filter @kzero/playground build

# Or directly in this directory
pnpm build
```

### Type Checking

```bash
# From the workspace root
pnpm --filter @kzero/playground check-types

# Or directly in this directory
pnpm check-types
```

## Project Structure

```
apps/playground/
├── src/
│   ├── App.tsx               # Main application with KzeroProvider
│   ├── main.tsx              # Application entry point
│   ├── Left.tsx              # Theme customization panel
│   ├── Center.tsx            # Main content and wallet interaction
│   ├── Right.tsx             # Transaction demo
│   ├── Header.tsx            # Application header
│   ├── Authed.tsx            # Authenticated state UI
│   ├── BaseContainer.tsx     # Layout container
│   ├── GlobalStyle.tsx       # Global styles
│   ├── components/           # Reusable components
│   ├── icons/                # Icon components
│   ├── hooks/                # Custom React hooks
│   ├── theme/                # Material-UI theme configuration
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Key Components

### App.tsx

Main application component that wraps everything with `KzeroProvider`.

```typescript
<KzeroProvider
  walletUrl={VITE_WALLET_URL}
  rpcUrl={VITE_RPC_URL}
  authEndpoint={VITE_AUTH_ENDPOINT}
  displayMode={displayMode}
  providers={selectedProviders}
  theme={kzeroTheme}
  debug={import.meta.env.DEV}
  onConnect={() => console.log('Connected')}
  onDisconnect={() => console.log('Disconnected')}
>
  <YourApp />
</KzeroProvider>
```

### Left.tsx - Theme Customization Panel

Interactive panel for customizing wallet theme:

- **Theme Mode**: Light / Dark / Custom
- **Primary Color**: Color picker for primary brand color
- **Background Color**: Color picker for background
- **Border Radius**: Small / Medium / Large
- **Provider Selection**: Toggle OAuth providers

**Features:**
- Real-time theme updates
- No iframe reload required
- Preview changes instantly

### Center.tsx - Wallet Interaction

Main content area showing wallet connection status:

- **Disconnected State**: Connect button
- **Connected State**:
  - Account address and name
  - Provider information
  - Account balance
  - Disconnect button

**Integration Example:**
```typescript
function Center() {
  const { account, isConnected, connect, disconnect } = useKzero();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Address: {account?.address}</p>
      <p>Provider: {account?.provider}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Right.tsx - Transaction Demo

Transaction sending demonstration:

- Connect to Polkadot blockchain
- Create transfer extrinsic
- Sign with wallet
- Submit to chain
- Display transaction hash

**Example:**
```typescript
const { sendTransaction, account } = useKzero();

const handleTransfer = async () => {
  const api = await ApiPromise.create({ provider });
  const transfer = api.tx.balances.transferKeepAlive(recipient, amount);

  const result = await sendTransaction(transfer.toJSON());
  const hash = await api.rpc.author.submitExtrinsic(result.signedTransaction);

  console.log('Transaction hash:', hash.toHex());
};
```

## Features Demonstrated

### 1. SDK Integration

Shows complete SDK setup:
- Provider configuration
- Hook usage
- Connection management
- Account state handling

### 2. Theme Customization

Demonstrates dynamic theming:
- Preset theme switching
- Custom color selection
- Border radius adjustment
- Real-time updates

### 3. OAuth Providers

Provider selection interface:
- Enable/disable providers
- Dynamic configuration
- Updates without reload

### 4. Display Modes

Toggle between modes:
- **Modal Mode**: Wallet as popup
- **Embedded Mode**: Wallet in layout

### 5. Transaction Signing

Complete transaction flow:
- Create transaction with Polkadot API
- Request signing from wallet
- Handle user confirmation
- Submit to blockchain
- Display result

### 6. Account Management

Account information display:
- Address (with copy)
- Name and email
- Provider icon
- Profile picture
- Balance (if available)

## Usage Examples

### Basic Connection

```typescript
import { KzeroProvider, useKzero } from '@kzero/zk-react';

function MyApp() {
  return (
    <KzeroProvider
      walletUrl="http://localhost:5176"
      rpcUrl="ws://127.0.0.1:9944"
      authEndpoint="http://localhost:3000"
    >
      <WalletButton />
    </KzeroProvider>
  );
}

function WalletButton() {
  const { connect, disconnect, isConnected, account } = useKzero();

  if (!isConnected) {
    return <button onClick={connect}>Connect</button>;
  }

  return (
    <div>
      <p>Connected: {account?.address}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Custom Theme

```typescript
import { KzeroProvider, darkTheme } from '@kzero/zk-react';
import type { ThemeConfig } from '@kzero/zk-core';

const myTheme: ThemeConfig = {
  colors: {
    primary: '#6366f1',
    background: '#1a1a1a',
    // ... other colors
  },
  radius: {
    base: '8px',
    card: '16px'
  }
};

<KzeroProvider theme={myTheme} {...otherProps}>
  <App />
</KzeroProvider>
```

### Transaction Sending

```typescript
import { useKzero } from '@kzero/zk-react';
import { ApiPromise, WsProvider } from '@polkadot/api';

function TransferButton() {
  const { sendTransaction, account } = useKzero();

  const handleTransfer = async () => {
    // Create API instance
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    // Create transfer
    const transfer = api.tx.balances.transferKeepAlive(
      'RECIPIENT_ADDRESS',
      1000000000000
    );

    // Sign with wallet
    const result = await sendTransaction(transfer.toJSON());

    // Submit to chain
    const hash = await api.rpc.author.submitExtrinsic(
      result.signedTransaction
    );

    console.log('Transaction hash:', hash.toHex());
  };

  return <button onClick={handleTransfer}>Send Transfer</button>;
}
```

## Development Tips

### Debug Mode

Debug logging is automatically enabled in development:

```typescript
<KzeroProvider
  debug={import.meta.env.DEV}  // Auto-enable in dev
  {...otherProps}
>
  <App />
</KzeroProvider>
```

### Hot Module Replacement

Vite HMR is enabled - changes to theme, providers, or code update instantly without full reload.

### Testing Different Configurations

Use the playground UI to test:
- Different theme combinations
- Various provider selections
- Modal vs embedded modes
- Different color schemes

## Common Use Cases

### 1. Testing SDK Integration

Use playground to verify SDK works in your environment:
- Connection establishment
- Account retrieval
- Transaction signing
- Theme application

### 2. Theme Development

Design your custom theme:
- Pick colors visually
- Test different radius values
- See changes in real-time
- Copy theme config

### 3. Provider Testing

Test OAuth providers:
- Select specific providers
- Test authentication flow
- Verify provider icons
- Check account info

### 4. Transaction Testing

Test transaction flows:
- Different transaction types
- Error handling
- User cancellation
- Success feedback

## Building for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

## Deployment

The playground can be deployed as a static site to:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

**Requirements:**
- Set environment variables for production endpoints
- Ensure HTTPS for wallet URL
- Configure CORS if needed

## Troubleshooting

### Wallet Not Loading

**Problem:** Wallet iframe doesn't load

**Solution:**
1. Verify wallet is running on port 5176
2. Check `VITE_WALLET_URL` in `.env.local`
3. Check browser console for errors

### Theme Not Applying

**Problem:** Theme changes not reflected

**Solution:**
1. Ensure wallet iframe has loaded
2. Check browser console for postMessage errors
3. Verify theme object structure

### Transaction Fails

**Problem:** Transaction signing fails

**Solution:**
1. Check Polkadot node is running
2. Verify `VITE_RPC_URL` is correct
3. Ensure account has balance for fees
4. Check browser console for detailed errors

### OAuth Not Working

**Problem:** OAuth authentication fails

**Solution:**
1. Check authentication service is running
2. Verify `VITE_AUTH_ENDPOINT` is correct
3. Check popup blocker settings
4. Verify OAuth credentials configured on backend

## License

[GPL-3.0](../../LICENSE)

## Related

- **[Main README](../../README.md)** - Project overview
- **[Wallet App](../wallet)** - Wallet application
- **[@kzero/zk-react](../../packages/zk-react)** - React SDK documentation
