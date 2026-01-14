// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type { MessageData, ZkAccount } from '@kzero/zk-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectionError, TransactionError } from '../../utils/errors.js';
import { WalletConnection } from '../WalletConnection.js';

describe('WalletConnection', () => {
  let mockPort: BidirectionalPort<MessageData>;
  let walletConnection: WalletConnection;
  let onAccountsChangeSpy: ReturnType<typeof vi.fn>;
  let onConnectionChangeSpy: ReturnType<typeof vi.fn>;

  const mockAccount: ZkAccount = {
    type: 'zk',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    provider: 'google',
    ephemeralPublicKey: '0xabcdef1234567890',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
    proofStatus: 'generated'
  };

  beforeEach(() => {
    // Create mock port
    mockPort = {
      request: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      destroy: vi.fn()
    } as unknown as BidirectionalPort<MessageData>;

    onAccountsChangeSpy = vi.fn();
    onConnectionChangeSpy = vi.fn();

    walletConnection = new WalletConnection(mockPort, {
      rpcUrl: 'https://rpc.example.com',
      authEndpoint: 'https://auth.example.com',
      debug: false,
      onAccountsChange: onAccountsChangeSpy as (accounts: ZkAccount[]) => void,
      onConnectionChange: onConnectionChangeSpy as (isConnected: boolean) => void
    });
  });

  describe('constructor', () => {
    it('creates instance and sets up event listeners', () => {
      expect(mockPort.on).toHaveBeenCalledWith('accounts.change', expect.any(Function));
      expect(mockPort.on).toHaveBeenCalledWith('auth.request', expect.any(Function));
    });

    it('initializes with empty accounts', () => {
      expect(walletConnection.getAccounts()).toEqual([]);
      expect(walletConnection.getCurrentAccount()).toBeNull();
      expect(walletConnection.isConnected()).toBe(false);
    });
  });

  describe('connect', () => {
    it('fetches accounts and updates state', async () => {
      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount] });

      await walletConnection.connect();

      expect(mockPort.request).toHaveBeenCalledWith('accounts.all', undefined);
      expect(walletConnection.getAccounts()).toEqual([mockAccount]);
      expect(walletConnection.getCurrentAccount()).toEqual(mockAccount);
      expect(walletConnection.isConnected()).toBe(true);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([mockAccount]);
      expect(onConnectionChangeSpy).toHaveBeenCalledWith(true);
    });

    it('handles empty accounts response', async () => {
      (mockPort.request as any).mockResolvedValue({ accounts: [] });

      await walletConnection.connect();

      expect(walletConnection.getAccounts()).toEqual([]);
      expect(walletConnection.getCurrentAccount()).toBeNull();
      expect(walletConnection.isConnected()).toBe(false);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([]);
      expect(onConnectionChangeSpy).toHaveBeenCalledWith(false);
    });

    it('throws ConnectionError on failure', async () => {
      (mockPort.request as any).mockRejectedValue(new Error('Network error'));

      await expect(walletConnection.connect()).rejects.toThrow(ConnectionError);
      await expect(walletConnection.connect()).rejects.toThrow('Failed to connect: Network error');
    });

    it('handles multiple accounts', async () => {
      const account2: ZkAccount = {
        ...mockAccount,
        address: '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount, account2] });

      await walletConnection.connect();

      expect(walletConnection.getAccounts()).toEqual([mockAccount, account2]);
      expect(walletConnection.getCurrentAccount()).toEqual(mockAccount); // First account is current
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount] });
      await walletConnection.connect();
      vi.clearAllMocks();
    });

    it('clears accounts and sends logout request', async () => {
      (mockPort.request as any).mockResolvedValue(null);

      await walletConnection.disconnect();

      expect(mockPort.request).toHaveBeenCalledWith('logout', undefined);
      expect(walletConnection.getAccounts()).toEqual([]);
      expect(walletConnection.getCurrentAccount()).toBeNull();
      expect(walletConnection.isConnected()).toBe(false);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([]);
      expect(onConnectionChangeSpy).toHaveBeenCalledWith(false);
    });

    it('throws ConnectionError on failure', async () => {
      (mockPort.request as any).mockRejectedValue(new Error('Disconnect failed'));

      await expect(walletConnection.disconnect()).rejects.toThrow(ConnectionError);
      await expect(walletConnection.disconnect()).rejects.toThrow('Failed to disconnect: Disconnect failed');
    });
  });

  describe('switchAccount', () => {
    beforeEach(async () => {
      const account2: ZkAccount = {
        ...mockAccount,
        address: '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount, account2] });
      await walletConnection.connect();
      vi.clearAllMocks();
    });

    it('switches to existing account', async () => {
      await walletConnection.switchAccount('0xabcdef1234567890abcdef1234567890abcdef12');

      expect(walletConnection.getCurrentAccount()?.address).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
      expect(onAccountsChangeSpy).toHaveBeenCalled();
    });

    it('throws error for non-existent account', async () => {
      await expect(walletConnection.switchAccount('0xnonexistent')).rejects.toThrow(ConnectionError);
      await expect(walletConnection.switchAccount('0xnonexistent')).rejects.toThrow('Account not found');
    });
  });

  describe('sendTransaction', () => {
    const mockTxRequest = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      blockHash: '0xabcd',
      blockNumber: '0x123',
      era: '0x0',
      genesisHash: '0xdef',
      method: '0x1234',
      nonce: '0x0',
      specVersion: '0x1',
      tip: '0x0',
      transactionVersion: '0x1',
      signedExtensions: [] as string[],
      version: 4
    } as const;

    const mockTxResponse = {
      id: '1',
      signature: '0xsignature',
      signedTransaction: '0xsignedtx'
    };

    beforeEach(async () => {
      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount] });
      await walletConnection.connect();
      vi.clearAllMocks();
    });

    it('sends transaction and returns response', async () => {
      (mockPort.request as any).mockResolvedValue(mockTxResponse);

      const response = await walletConnection.sendTransaction(mockTxRequest);

      expect(mockPort.request).toHaveBeenCalledWith('sign.request', mockTxRequest);
      expect(response).toEqual({
        id: mockTxResponse.id,
        signature: mockTxResponse.signature,
        signedTransaction: mockTxResponse.signedTransaction
      });
    });

    it('throws ConnectionError when not connected', async () => {
      await walletConnection.disconnect();

      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow(ConnectionError);
      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow('No account connected');
    });

    it('throws TransactionError when no signed transaction returned', async () => {
      (mockPort.request as any).mockResolvedValue({
        id: '1',
        signature: '0xsignature',
        signedTransaction: undefined
      });

      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow(TransactionError);
      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow(
        'No signed transaction returned from wallet'
      );
    });

    it('throws TransactionError on request failure', async () => {
      (mockPort.request as any).mockRejectedValue(new Error('User cancelled'));

      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow(TransactionError);
      await expect(walletConnection.sendTransaction(mockTxRequest)).rejects.toThrow(
        'Transaction failed: User cancelled'
      );
    });
  });

  describe('signMessage', () => {
    it('throws NotSupportedError', () => {
      expect(() => walletConnection.signMessage('test message')).toThrow('Message signing is not supported yet');
    });
  });

  describe('updateTheme', () => {
    it('emits theme.update event', () => {
      const theme = {
        colors: {
          background: '#000000',
          foreground: '#FFFFFF',
          primary: '#5328E7',
          primaryForeground: '#FFFFFF',
          secondary: '#666666',
          secondaryForeground: '#FFFFFF',
          success: '#00AA00',
          successForeground: '#FFFFFF',
          error: '#FF0000',
          errorForeground: '#FFFFFF',
          warning: '#FFAA00',
          warningForeground: '#000000',
          border: '#333333',
          divider: '#444444'
        },
        radius: {
          base: '8px',
          card: '12px'
        }
      };

      walletConnection.updateTheme(theme);

      expect(mockPort.emit).toHaveBeenCalledWith('theme.update', theme);
    });
  });

  describe('updateProviders', () => {
    it('emits providers.update event', () => {
      const providers = ['google', 'github', 'twitter'] as const;

      walletConnection.updateProviders([...providers]);

      expect(mockPort.emit).toHaveBeenCalledWith('providers.update', [...providers]);
    });
  });

  describe('cancelSign', () => {
    it('emits sign.cancelled event', () => {
      walletConnection.cancelSign();

      expect(mockPort.emit).toHaveBeenCalledWith('sign.cancelled', null);
    });
  });

  describe('handleAccountChange', () => {
    it('adds new account and updates state', async () => {
      // Get the accounts.change handler
      const accountsChangeHandler = (mockPort.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'accounts.change'
      )[1];

      accountsChangeHandler(mockAccount);

      expect(walletConnection.getAccounts()).toEqual([mockAccount]);
      expect(walletConnection.getCurrentAccount()).toEqual(mockAccount);
      expect(walletConnection.isConnected()).toBe(true);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([mockAccount]);
      expect(onConnectionChangeSpy).toHaveBeenCalledWith(true);
    });

    it('updates existing account', async () => {
      const accountsChangeHandler = (mockPort.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'accounts.change'
      )[1];

      // Add initial account
      accountsChangeHandler(mockAccount);
      vi.clearAllMocks();

      // Update the same account
      const updatedAccount = { ...mockAccount, name: 'Updated Name' };

      accountsChangeHandler(updatedAccount);

      expect(walletConnection.getAccounts()).toEqual([updatedAccount]);
      expect(walletConnection.getCurrentAccount()).toEqual(updatedAccount);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([updatedAccount]);
    });

    it('handles logout (null account)', async () => {
      const accountsChangeHandler = (mockPort.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'accounts.change'
      )[1];

      // First add an account
      accountsChangeHandler(mockAccount);
      vi.clearAllMocks();

      // Then logout
      accountsChangeHandler(null);

      expect(walletConnection.getAccounts()).toEqual([]);
      expect(walletConnection.getCurrentAccount()).toBeNull();
      expect(walletConnection.isConnected()).toBe(false);
      expect(onAccountsChangeSpy).toHaveBeenCalledWith([]);
      expect(onConnectionChangeSpy).toHaveBeenCalledWith(false);
    });

    it('handles multiple accounts', async () => {
      const accountsChangeHandler = (mockPort.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'accounts.change'
      )[1];

      const account2: ZkAccount = {
        ...mockAccount,
        address: '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      accountsChangeHandler(mockAccount);
      accountsChangeHandler(account2);

      expect(walletConnection.getAccounts()).toEqual([mockAccount, account2]);
    });
  });

  describe('handleAuthRequest', () => {
    it('opens auth window and emits window-closed event', async () => {
      const authRequestHandler = (mockPort.on as any).mock.calls.find((call: any[]) => call[0] === 'auth.request')[1];

      const authPayload = {
        provider: 'google' as const,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=123',
        sessionId: 'session-123'
      };

      // Mock window.open to return a mock window
      const mockWindow = {
        closed: false,
        close: vi.fn()
      };

      vi.stubGlobal('open', vi.fn().mockReturnValue(mockWindow));

      // Call handler (it's async but we won't await)
      const promise = authRequestHandler(authPayload);

      // Simulate window closing
      await vi.waitFor(() => {
        mockWindow.closed = true;
      });

      await promise;

      expect(mockPort.emit).toHaveBeenCalledWith('auth.window-closed', undefined);

      vi.unstubAllGlobals();
    });

    it('emits window-closed even on error', async () => {
      const authRequestHandler = (mockPort.on as any).mock.calls.find((call: any[]) => call[0] === 'auth.request')[1];

      const authPayload = {
        provider: 'google' as const,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=123',
        sessionId: 'session-123'
      };

      // Mock window.open to return null (popup blocked)
      vi.stubGlobal('open', vi.fn().mockReturnValue(null));

      await authRequestHandler(authPayload);

      expect(mockPort.emit).toHaveBeenCalledWith('auth.window-closed', undefined);

      vi.unstubAllGlobals();
    });
  });

  describe('destroy', () => {
    it('cleans up resources', () => {
      walletConnection.destroy();

      expect(mockPort.off).toHaveBeenCalledWith('accounts.change', expect.any(Function));
      expect(mockPort.off).toHaveBeenCalledWith('auth.request', expect.any(Function));
      expect(mockPort.destroy).toHaveBeenCalled();
    });
  });

  describe('getAccounts', () => {
    it('returns copy of accounts array', async () => {
      (mockPort.request as any).mockResolvedValue({ accounts: [mockAccount] });
      await walletConnection.connect();

      const accounts = walletConnection.getAccounts();

      // Mutating the returned array should not affect internal state
      accounts.push({ ...mockAccount, address: '0xnew' });

      expect(walletConnection.getAccounts()).toEqual([mockAccount]);
    });
  });
});
