// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type { MessageData } from '@kzero/zk-core';

import { createContext, useContext } from 'react';

import { AuthService } from './authService.js';

/**
 * App context value interface
 */
export interface AppContextValue {
  /**
   * Bidirectional port for postmessage communication
   */
  port: BidirectionalPort<MessageData>;

  /**
   * Authentication service instance
   */
  authService: AuthService;

  /**
   * Auth endpoint URL
   */
  authEndpoint: string;
}

export const AppContext = createContext<AppContextValue | null>(null);

/**
 * Hook to access app context
 *
 * @throws Error if used outside of AppProvider
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
