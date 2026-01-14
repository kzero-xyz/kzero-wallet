// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ReactNode } from 'react';
import type { LoginProvider } from '@kzero/zk-core';
import type { ThemeConfig } from '../defaults.js';

/**
 * Display mode for wallet interface
 */
export type DisplayMode = 'modal' | 'embedded';

/**
 * Configuration options for KzeroProvider
 */
export interface KzeroProviderProps {
  /**
   * React children components
   */
  children: ReactNode;

  /**
   * URL of the Kzero wallet iframe
   */
  walletUrl: string;

  /**
   * RPC endpoint URL for blockchain connection
   */
  rpcUrl: string;

  /**
   * Authentication endpoint URL
   */
  authEndpoint: string;

  /**
   * Display mode for wallet
   * @default 'modal'
   *
   * TODO: Currently only 'embedded' is fully implemented
   * 'modal' mode needs backdrop, positioning, and animation
   */
  displayMode?: DisplayMode;

  /**
   * Theme configuration
   *
   * TODO: Send to wallet iframe via postmessage 'theme.set' event
   * Currently wallet needs to support dynamic theme updates
   */
  theme?: ThemeConfig;

  /**
   * Provider list to show in wallet
   *
   * TODO: Pass to wallet iframe via URL param or postmessage
   * Currently wallet shows default provider list
   */
  providers?: LoginProvider[];

  /**
   * Enable debug logging for SDK components
   * @default false
   */
  debug?: boolean;

  /**
   * Callback function triggered when wallet is connected
   */
  onConnect?: () => void;

  /**
   * Callback function triggered when wallet is disconnected
   */
  onDisconnect?: () => void;
}
