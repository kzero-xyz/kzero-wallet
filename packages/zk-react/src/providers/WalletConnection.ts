// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type { LoginProvider, MessageData, ThemeConfig, ZkAccount } from '@kzero/zk-core';
import type { TransactionRequest, TransactionResponse } from '../types/index.js';

import { Logger } from '@kzero/zk-core';

import { AuthWindowManager } from '../utils/authWindow.js';
import { ConnectionError, NotSupportedError, TransactionError } from '../utils/errors.js';

/**
 * Configuration for WalletConnection
 */
export interface WalletConnectionConfig {
  /**
   * RPC endpoint URL
   */
  rpcUrl: string;

  /**
   * Authentication endpoint URL
   */
  authEndpoint: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback when accounts change
   */
  onAccountsChange?: (accounts: ZkAccount[]) => void;

  /**
   * Callback when connection state changes
   */
  onConnectionChange?: (isConnected: boolean) => void;
}

/**
 * Core class for managing wallet connection and communication
 */
export class WalletConnection {
  private port: BidirectionalPort<MessageData>;
  private config: WalletConnectionConfig;
  private accounts: ZkAccount[] = [];
  private currentAccount: ZkAccount | null = null;
  private isConnectedState = false;
  private authWindowManager: AuthWindowManager;
  private log: Logger;

  constructor(port: BidirectionalPort<MessageData>, config: WalletConnectionConfig) {
    this.port = port;
    this.config = config;
    this.authWindowManager = new AuthWindowManager();
    this.log = new Logger('WalletConnection', { enabled: config.debug ?? false });

    // Listen to account change events from wallet
    this.port.on('accounts.change', this.handleAccountChange.bind(this));

    // Listen to auth requests from wallet
    this.port.on('auth.request', this.handleAuthRequest.bind(this));
  }

  /**
   * Handle account change events from wallet
   */
  private handleAccountChange = (account: ZkAccount | null): void => {
    if (account) {
      // Update or add account
      const existingIndex = this.accounts.findIndex((acc) => acc.address === account.address);

      if (existingIndex >= 0) {
        this.accounts[existingIndex] = account;
      } else {
        this.accounts.push(account);
      }

      // Set as current if it's the first account or matches current
      if (!this.currentAccount || this.currentAccount.address === account.address) {
        this.currentAccount = account;
      }

      // Update connection state
      const wasConnected = this.isConnectedState;

      this.isConnectedState = this.accounts.length > 0;

      // Notify if connection state changed
      if (wasConnected !== this.isConnectedState) {
        this.config.onConnectionChange?.(this.isConnectedState);
      }
    } else {
      // Logout - clear all accounts
      this.accounts = [];
      this.currentAccount = null;
      this.isConnectedState = false;
      this.config.onConnectionChange?.(false);
    }

    this.config.onAccountsChange?.(this.accounts);
  };

  /**
   * Connect to wallet and retrieve accounts
   */
  async connect(): Promise<void> {
    try {
      // Fetch all accounts
      const { accounts } = await this.port.request('accounts.all', undefined);

      this.accounts = accounts;
      this.currentAccount = accounts[0] ?? null;
      this.isConnectedState = accounts.length > 0;

      this.config.onAccountsChange?.(this.accounts);
      this.config.onConnectionChange?.(this.isConnectedState);
    } catch (error) {
      throw new ConnectionError(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    try {
      await this.port.request('logout', undefined);

      this.accounts = [];
      this.currentAccount = null;
      this.isConnectedState = false;

      this.config.onAccountsChange?.(this.accounts);
      this.config.onConnectionChange?.(false);
    } catch (error) {
      throw new ConnectionError(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Switch to a different account
   */
  async switchAccount(address: string): Promise<void> {
    const account = this.accounts.find((acc) => acc.address === address);

    if (!account) {
      throw new ConnectionError(`Account not found: ${address}`);
    }

    this.currentAccount = account;
    this.config.onAccountsChange?.(this.accounts);
  }

  /**
   * Send transaction for signing
   */
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    if (!this.currentAccount) {
      throw new ConnectionError('No account connected');
    }

    if (!this.isConnectedState) {
      throw new ConnectionError('Wallet is not connected');
    }

    try {
      // Request signature from wallet with complete payload
      const result = await this.port.request('sign.request', tx);

      if (!result.signedTransaction) {
        throw new TransactionError('No signed transaction returned from wallet');
      }

      return {
        id: result.id,
        signature: result.signature,
        signedTransaction: result.signedTransaction
      };
    } catch (error) {
      throw new TransactionError(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sign a message (not supported yet)
   */
  signMessage(_message: string): Promise<string> {
    throw new NotSupportedError('Message signing is not supported yet');
  }

  /**
   * Get all connected accounts
   */
  getAccounts(): ZkAccount[] {
    return [...this.accounts];
  }

  /**
   * Get current selected account
   */
  getCurrentAccount(): ZkAccount | null {
    return this.currentAccount;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.isConnectedState;
  }

  /**
   * Update wallet theme dynamically
   * Sends theme configuration to wallet iframe via postMessage
   */
  updateTheme(theme: ThemeConfig): void {
    this.log.debug('Updating theme:', theme);
    this.port.emit('theme.update', theme);
  }

  /**
   * Update wallet providers dynamically
   * Sends providers list to wallet iframe via postMessage
   */
  updateProviders(providers: LoginProvider[]): void {
    this.log.debug('Updating providers:', providers);
    this.port.emit('providers.update', providers);
  }

  /**
   * Cancel ongoing sign request
   * Sends sign.cancelled event to wallet iframe
   */
  cancelSign(): void {
    this.log.debug('Cancelling sign request');
    this.port.emit('sign.cancelled', null);
  }

  /**
   * Handle authentication request from wallet
   */
  private async handleAuthRequest(payload: {
    provider: LoginProvider;
    authUrl: string;
    sessionId: string;
  }): Promise<void> {
    try {
      // Open authentication window and wait for it to close
      await this.authWindowManager.openAuthWindow(payload.authUrl);

      // Notify wallet that the window has been closed
      this.port.emit('auth.window-closed', undefined);
    } catch (error) {
      this.log.error('Auth window error:', error);

      // Still notify wallet even if there's an error
      this.port.emit('auth.window-closed', undefined);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.authWindowManager.closeAuthWindow();
    this.port.off('accounts.change', this.handleAccountChange);
    this.port.off('auth.request', this.handleAuthRequest);
    this.port.destroy();
  }
}
