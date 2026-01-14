// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ReactNode } from 'react';
import type { BidirectionalPort } from '@kzero/message-port';
import type { MessageData } from '@kzero/zk-core';

import { useEffect, useState } from 'react';

import { createIframePort } from '@kzero/message-port';
import { Logger } from '@kzero/zk-core';

import { AuthService } from './authService.js';
import { useCardStore } from './cardStore.js';
import { getMessageHandler, initializeMessageHandler } from './messageHandler.js';
import { proofPollingService } from './proofPollingService.js';
import { providersManager } from './providersManager.js';
import { sessionManager } from './sessionManager.js';
import { restoreState } from './stateRestoration.js';
import { getDebugFromUrl, getProvidersFromUrl } from './urlParams.js';
import { AppContext, type AppContextValue } from './useAppContext.js';

const log = new Logger('AppContext', { enabled: getDebugFromUrl() });

/**
 * Module-level singleton to prevent multiple port instances in React StrictMode
 * React StrictMode intentionally double-renders components in development,
 * which would create multiple MessageChannel connections without this protection.
 *
 * Best practice: Use Promise caching to handle concurrent initialization attempts
 */
let portInstance: BidirectionalPort<MessageData> | null = null;
let isInitializingPort = false;
let initPromise: Promise<BidirectionalPort<MessageData>> | null = null;

/**
 * Get or create the singleton port instance
 * This function ensures only one port is created even with StrictMode double-rendering
 */
async function getOrCreatePort(
  parentOrigin: string,
  options: { timeout: number; debug: boolean }
): Promise<BidirectionalPort<MessageData>> {
  // Already exists, return immediately
  if (portInstance) {
    log.debug('Reusing existing port instance');

    return portInstance;
  }

  // Currently initializing, wait for the same promise
  if (isInitializingPort && initPromise) {
    log.debug('Waiting for ongoing port initialization');

    return initPromise;
  }

  // Start new initialization
  log.debug('Starting new port initialization');
  isInitializingPort = true;

  initPromise = createIframePort<MessageData>(parentOrigin, options)
    .then((port) => {
      portInstance = port;
      log.debug('Port initialized successfully');

      return port;
    })
    .catch((error) => {
      log.error('Port initialization failed:', error);
      // Reset on failure to allow retry
      portInstance = null;
      throw error;
    })
    .finally(() => {
      isInitializingPort = false;
      initPromise = null;
    });

  return initPromise;
}

/**
 * App Provider component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [contextValue, setContextValue] = useState<AppContextValue | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initializePort() {
      try {
        // Apply providers from URL if provided
        const urlProviders = getProvidersFromUrl();

        if (urlProviders) {
          log.debug('Applying providers from URL:', urlProviders);
          providersManager.setProviders(urlProviders);
        }

        // Get auth endpoint from environment variable
        const authEndpoint = import.meta.env.VITE_AUTH_ENDPOINT || 'http://localhost:3000';

        // Get parent origin
        // In development, use the parent URL from environment variable
        // In production, use ancestorOrigins for security
        let parentOrigin = '*';

        if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
          parentOrigin = window.location.ancestorOrigins[0];
        }

        // Use the singleton function - it handles all the complexity
        const port = await getOrCreatePort(parentOrigin, {
          timeout: 30000,
          debug: getDebugFromUrl()
        });

        // Create auth service
        const authService = new AuthService(authEndpoint);

        // Initialize message handler for parent communication
        const messageHandler = initializeMessageHandler(port);

        // Subscribe to session manager account changes
        unsubscribe = sessionManager.onAccountChange((account) => {
          log.debug('Session account changed, emitting to parent:', account);
          messageHandler.emitAccountChange(account);
        });

        setContextValue({
          port,
          authService,
          authEndpoint
        });

        // Restore login state after context is set
        const restoredState = restoreState();

        if (restoredState) {
          const { cardData, shouldResumePolling } = restoredState;

          // Initialize card state
          useCardStore.getState().initialize(cardData);

          // Notify parent about restored account
          // This is needed because sessionManager only emits on state *change*,
          // not on initial restore from sessionStorage
          const session = sessionManager.getSession();

          if (session?.account) {
            messageHandler.emitAccountChange(session.account);
          }

          // Resume proof polling if needed
          if (shouldResumePolling && (cardData.type === 'encrypt' || cardData.type === 'login-success')) {
            // Get ephemeralPublicKey from session
            const ephemeralPublicKey = sessionManager.getEphemeralPublicKey();

            if (ephemeralPublicKey) {
              proofPollingService.start(authService, ephemeralPublicKey);
            }
          }
        }
      } catch (err) {
        log.error('Failed to initialize app:', err);
        setError(err as Error);
      }
    }

    initializePort();

    // Cleanup function
    return () => {
      log.debug('Cleanup called');

      // Destroy message handler
      getMessageHandler()?.destroy();

      // Unsubscribe from account changes
      if (unsubscribe) {
        unsubscribe();
      }

      // Note: We intentionally DON'T destroy portInstance here
      // because it's a module-level singleton that may be reused
      // if StrictMode re-mounts the component.
      // The port will be cleaned up when the iframe is actually unloaded.
    };
  }, []);

  if (error) {
    return (
      <div className='flex h-full w-full items-center justify-center p-4'>
        <div className='text-center'>
          <h2 className='mb-2 text-lg font-semibold text-error'>Initialization Error</h2>
          <p className='text-sm text-foreground/50'>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!contextValue) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent' />
          <p className='text-sm text-foreground/50'>Initializing wallet...</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
