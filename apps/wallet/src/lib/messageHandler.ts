// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type {
  LoginProvider,
  MessageData,
  SignerPayloadJSON,
  SignerResult,
  ThemeConfig,
  ZkAccount
} from '@kzero/zk-core';

import { Logger } from '@kzero/zk-core';

import { applyTheme } from './applyTheme.js';
import { useCardStore } from './cardStore.js';
import { providersManager } from './providersManager.js';
import { sessionManager } from './sessionManager.js';
import { getDebugFromUrl } from './urlParams.js';

const log = new Logger('MessageHandler', { enabled: getDebugFromUrl() });

/**
 * Message handler for parent-wallet communication
 * Handles requests from parent window (dApp)
 */
export class MessageHandler {
  private port: BidirectionalPort<MessageData>;
  private pendingSignRequest: {
    resolve: (result: SignerResult) => void;
    reject: (error: Error) => void;
  } | null = null;

  constructor(port: BidirectionalPort<MessageData>) {
    this.port = port;
    log.debug('Initializing message handler');
    this.setupHandlers();
    log.debug('Message handler initialized successfully');
  }

  /**
   * Setup all message handlers
   */
  private setupHandlers(): void {
    log.debug('Setting up handlers...');

    // Handle accounts.all request
    this.port.handle('accounts.all', this.handleAccountsAll.bind(this));
    log.debug('Registered handler for accounts.all');

    // Handle logout request
    this.port.handle('logout', this.handleLogout.bind(this));
    log.debug('Registered handler for logout');

    // Handle sign.request
    this.port.handle('sign.request', this.handleSignRequest.bind(this));
    log.debug('Registered handler for sign.request');

    // Listen to theme.update event
    this.port.on('theme.update', this.handleThemeUpdate.bind(this));
    log.debug('Registered listener for theme.update');

    // Listen to providers.update event
    this.port.on('providers.update', this.handleProvidersUpdate.bind(this));
    log.debug('Registered listener for providers.update');

    // Listen to sign.cancelled event
    this.port.on('sign.cancelled', this.handleSignCancelled.bind(this));
    log.debug('Registered listener for sign.cancelled');
  }

  /**
   * Handle accounts.all request
   * Parent wants to get all connected accounts
   */
  private async handleAccountsAll(): Promise<{ accounts: ZkAccount[] }> {
    const session = sessionManager.getSession();

    log.debug('accounts.all request received, session:', session);

    if (!session || !session.account) {
      return { accounts: [] };
    }

    return { accounts: [session.account] };
  }

  /**
   * Handle logout request
   * Parent wants to disconnect the wallet
   */
  private async handleLogout(): Promise<null> {
    log.debug('logout request received');

    // Terminate session
    sessionManager.terminate();

    // Notify parent that account changed to null (logged out)
    this.emitAccountChange(null);

    return null;
  }

  /**
   * Handle sign.request
   * Parent wants to sign a transaction
   */
  private async handleSignRequest(payload: SignerPayloadJSON, origin: string): Promise<SignerResult> {
    log.debug('sign.request received:', payload, 'origin:', origin);

    // Return a promise that will be resolved/rejected by the SignExtrinsic component
    return new Promise((resolve, reject) => {
      // Store the promise callbacks
      this.pendingSignRequest = { resolve, reject };

      // Navigate to sign-extrinsic card with the transaction data
      useCardStore.getState().navigateTo({
        type: 'sign-extrinsic',
        payload,
        origin,
        wsEndpoint: (import.meta as any).env?.VITE_WS_ENDPOINT
      });
    });
  }

  /**
   * Resolve the pending sign request with a successful result
   * Called by SignExtrinsic component when user signs successfully
   */
  resolveSignRequest(result: SignerResult): void {
    if (!this.pendingSignRequest) {
      log.error('No pending sign request to resolve');

      return;
    }

    log.debug('Resolving sign request with result:', result);

    this.pendingSignRequest.resolve(result);
    this.pendingSignRequest = null;
  }

  /**
   * Reject the pending sign request with an error
   * Called by SignExtrinsic component when user cancels or error occurs
   */
  rejectSignRequest(error: string): void {
    if (!this.pendingSignRequest) {
      log.error('No pending sign request to reject');

      return;
    }

    log.debug('Rejecting sign request with error:', error);

    this.pendingSignRequest.reject(new Error(error));
    this.pendingSignRequest = null;
  }

  /**
   * Handle sign.cancelled event from parent
   * Parent (user) cancelled the sign request by closing the modal
   */
  private handleSignCancelled(): void {
    log.debug('sign.cancelled event received');

    if (this.pendingSignRequest) {
      // Reject the pending sign request
      this.rejectSignRequest('User cancelled the transaction');

      // Navigate back to welcome screen
      useCardStore.getState().navigateTo({ type: 'welcome' });
    }
  }

  /**
   * Handle theme.update event from parent
   * Parent wants to update the wallet theme dynamically
   */
  private handleThemeUpdate(theme: ThemeConfig): void {
    log.debug('theme.update event received:', theme);
    applyTheme(theme);
  }

  /**
   * Handle providers.update event from parent
   * Parent wants to update the wallet providers list dynamically
   */
  private handleProvidersUpdate(providers: LoginProvider[]): void {
    log.debug('providers.update event received:', providers);
    providersManager.setProviders(providers);
  }

  /**
   * Emit account change event to parent
   * Called when user logs in or logs out
   */
  emitAccountChange(account: ZkAccount | null): void {
    log.debug('Emitting accounts.change:', account);
    this.port.emit('accounts.change', account);
  }

  /**
   * Clean up handlers
   */
  destroy(): void {
    this.port.off('theme.update', this.handleThemeUpdate);
    this.port.off('providers.update', this.handleProvidersUpdate);
    this.port.off('sign.cancelled', this.handleSignCancelled);
    this.port.destroy();
  }
}

// Export singleton instance (will be initialized in AppContext)
let messageHandlerInstance: MessageHandler | null = null;

export function initializeMessageHandler(port: BidirectionalPort<MessageData>): MessageHandler {
  if (!messageHandlerInstance) {
    messageHandlerInstance = new MessageHandler(port);
  }

  return messageHandlerInstance;
}

export function getMessageHandler(): MessageHandler | null {
  return messageHandlerInstance;
}
