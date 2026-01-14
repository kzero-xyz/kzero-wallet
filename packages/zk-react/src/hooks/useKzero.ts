// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ZkAccount } from '@kzero/zk-core';
import type { TransactionRequest, TransactionResponse } from '../types/index.js';

import { useKzeroContext } from '../context/KzeroContext.js';

/**
 * Return value of useKzero hook
 */
export interface UseKzeroReturn {
  /**
   * All connected accounts
   */
  accounts: ZkAccount[];

  /**
   * Currently selected account
   */
  account: ZkAccount | null;

  /**
   * Connect to wallet
   */
  connect: () => Promise<void>;

  /**
   * Disconnect from wallet
   */
  disconnect: () => Promise<void>;

  /**
   * Whether wallet is connected
   */
  isConnected: boolean;

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

/**
 * Main hook for interacting with Kzero wallet
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { account, connect, disconnect, isConnected } = useKzero();
 *
 *   return (
 *     <div>
 *       {!isConnected ? (
 *         <button onClick={connect}>Connect</button>
 *       ) : (
 *         <div>
 *           <p>Account: {account?.address}</p>
 *           <button onClick={disconnect}>Disconnect</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws Error if used outside of KzeroProvider
 */
export function useKzero(): UseKzeroReturn {
  const context = useKzeroContext();

  return {
    accounts: context.accounts,
    account: context.currentAccount,
    connect: context.connect,
    disconnect: context.disconnect,
    isConnected: context.isConnected,
    switchAccount: context.switchAccount,
    signMessage: context.signMessage,
    sendTransaction: context.sendTransaction,
    showWallet: context.showWallet,
    hideWallet: context.hideWallet
  };
}
