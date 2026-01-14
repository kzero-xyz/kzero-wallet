// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { MessageData, SignerPayloadJSON, ZkAccount } from '@kzero/zk-core';
import type { KzeroProviderProps } from '../types/index.js';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createParentPort } from '@kzero/message-port';
import { Logger } from '@kzero/zk-core';

import { WalletIframe } from '../components/WalletIframe.js';
import { KzeroContext } from '../context/KzeroContext.js';
import { getOriginFromUrl } from '../utils/helpers.js';
import { serializeProvidersToUrl } from '../utils/providersSerializer.js';
import { serializeThemeToUrl } from '../utils/themeSerializer.js';
import { WalletConnection } from './WalletConnection.js';

const log = new Logger('KzeroProvider');

/**
 * Kzero Provider Component
 * Manages wallet connection and provides context to child components
 */
export function KzeroProvider({
  children,
  walletUrl,
  rpcUrl,
  authEndpoint,
  displayMode = 'modal',
  theme,
  providers,
  debug = false,
  onConnect,
  onDisconnect
}: KzeroProviderProps) {
  const debugRef = useRef<boolean>(debug);

  // Configure logger based on debug prop
  log.configure({ enabled: debug });

  // Build wallet URL with debug, theme, providers, and displayMode parameters
  const walletUrlWithParams = useMemo(() => {
    const url = new URL(walletUrl);

    if (debug) {
      url.searchParams.set('debug', 'true');
    }

    // Add displayMode parameter
    url.searchParams.set('mode', displayMode);

    // Add initial theme parameter if provided
    if (theme) {
      const themeParam = serializeThemeToUrl(theme);

      if (themeParam) {
        url.searchParams.set('theme', themeParam);
      }
    }

    // Add initial providers parameter if provided
    if (providers) {
      const providersParam = serializeProvidersToUrl(providers);

      if (providersParam) {
        url.searchParams.set('providers', providersParam);
      }
    }

    return url.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletUrl, debug, displayMode, providers]);
  const [accounts, setAccounts] = useState<ZkAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<ZkAccount | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);

  const walletConnectionRef = useRef<WalletConnection | null>(null);

  // Auto-update theme when it changes
  useEffect(() => {
    if (walletConnectionRef.current && theme) {
      log.debug('Theme changed, updating wallet:', theme);
      walletConnectionRef.current.updateTheme(theme);
    }
  }, [theme]);

  // Auto-update providers when they change
  useEffect(() => {
    if (walletConnectionRef.current && providers) {
      log.debug('Providers changed, updating wallet:', providers);
      walletConnectionRef.current.updateProviders(providers);
    }
  }, [providers]);

  // Initialize wallet connection when iframe loads
  const handleIframeLoad = useCallback(
    async (iframe: HTMLIFrameElement) => {
      log.debug('handleIframeLoad called');

      try {
        // Clean up existing connections before creating new ones
        if (walletConnectionRef.current) {
          log.debug('Destroying existing wallet connection');
          walletConnectionRef.current.destroy();
          walletConnectionRef.current = null;
        }

        const targetOrigin = getOriginFromUrl(walletUrl);

        log.debug('Creating new parent port');

        // Create bidirectional port
        const port = await createParentPort<MessageData>(iframe, targetOrigin, {
          timeout: 30000,
          debug: debugRef.current
        });

        log.debug('Creating new wallet connection');

        // Create wallet connection
        const walletConnection = new WalletConnection(port, {
          rpcUrl,
          authEndpoint,
          debug: debugRef.current,
          onAccountsChange: (newAccounts) => {
            setAccounts(newAccounts);
            setCurrentAccount(walletConnection.getCurrentAccount());
          },
          onConnectionChange: (connected) => {
            setIsConnected(connected);

            if (connected) {
              onConnect?.();
            } else {
              onDisconnect?.();
            }
          }
        });

        walletConnectionRef.current = walletConnection;

        log.debug('Initialization completed successfully');
      } catch (error) {
        log.error('Failed to initialize wallet connection:', error);
      }
    },
    [walletUrl, rpcUrl, authEndpoint, onConnect, onDisconnect]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      log.debug('Cleanup called');

      if (walletConnectionRef.current) {
        walletConnectionRef.current.destroy();
        walletConnectionRef.current = null;
      }
    };
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      walletUrl: walletUrlWithParams,
      accounts,
      currentAccount,
      isConnected,
      isWalletVisible,
      handleIframeLoad, // Expose for WalletCard in embedded mode
      connect: async () => {
        if (!walletConnectionRef.current) {
          throw new Error('Wallet connection not initialized');
        }

        await walletConnectionRef.current.connect();

        // Only show modal in modal mode
        if (displayMode === 'modal') {
          setIsWalletVisible(true);
        }
      },
      disconnect: async () => {
        if (!walletConnectionRef.current) {
          throw new Error('Wallet connection not initialized');
        }

        await walletConnectionRef.current.disconnect();
        setIsWalletVisible(false);
      },
      switchAccount: async (address: string) => {
        if (!walletConnectionRef.current) {
          throw new Error('Wallet connection not initialized');
        }

        await walletConnectionRef.current.switchAccount(address);
      },
      sendTransaction: async (tx: SignerPayloadJSON) => {
        if (!walletConnectionRef.current) {
          throw new Error('Wallet connection not initialized');
        }

        try {
          // Always show wallet modal when sending transaction
          setIsWalletVisible(true);

          // Send transaction and wait for signature
          const result = await walletConnectionRef.current.sendTransaction(tx);

          // Auto close modal after successful signature
          setIsWalletVisible(false);

          return result;
        } catch (error) {
          // Also close modal on error or user cancellation
          setIsWalletVisible(false);
          throw error;
        }
      },
      signMessage: async (message: string) => {
        if (!walletConnectionRef.current) {
          throw new Error('Wallet connection not initialized');
        }

        return walletConnectionRef.current.signMessage(message);
      },
      showWallet: () => {
        setIsWalletVisible(true);
      },
      hideWallet: () => {
        setIsWalletVisible(false);
      }
    }),
    [walletUrlWithParams, accounts, currentAccount, isConnected, isWalletVisible, handleIframeLoad, displayMode]
  );

  // Handle wallet modal close
  const handleWalletClose = useCallback(() => {
    // Notify wallet iframe to cancel any ongoing sign request
    if (walletConnectionRef.current) {
      walletConnectionRef.current.cancelSign();
    }

    setIsWalletVisible(false);
  }, []);

  // In embedded mode, user renders WalletCard themselves
  // In modal mode, we render WalletIframe here
  return (
    <KzeroContext.Provider value={contextValue}>
      {displayMode === 'modal' && (
        <WalletIframe
          walletUrl={walletUrlWithParams}
          visible={isWalletVisible}
          onLoad={handleIframeLoad}
          onClose={handleWalletClose}
        />
      )}
      {children}
    </KzeroContext.Provider>
  );
}
