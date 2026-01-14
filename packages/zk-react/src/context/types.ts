// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ZkAccount } from '@kzero/zk-core';
import type { TransactionRequest, TransactionResponse } from '../types/index.js';

/**
 * Context state interface
 */
export interface KzeroContextState {
  /**
   * Wallet URL for iframe src
   */
  walletUrl: string;

  /**
   * All connected accounts
   */
  accounts: ZkAccount[];

  /**
   * Currently selected account
   */
  currentAccount: ZkAccount | null;

  /**
   * Whether wallet is connected
   */
  isConnected: boolean;

  /**
   * Whether wallet iframe is visible
   */
  isWalletVisible: boolean;

  /**
   * Connect to wallet
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
   * Send transaction for signing
   */
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResponse>;

  /**
   * Sign a message
   */
  signMessage: (message: string) => Promise<string>;

  /**
   * Show wallet UI
   */
  showWallet: () => void;

  /**
   * Hide wallet UI
   */
  hideWallet: () => void;

  /**
   * Handle iframe load event (internal, used by WalletCard)
   */
  handleIframeLoad: (iframe: HTMLIFrameElement) => void;
}
