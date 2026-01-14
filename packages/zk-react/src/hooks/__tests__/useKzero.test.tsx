// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ZkAccount } from '@kzero/zk-core';
import type { TransactionRequest, TransactionResponse } from '../../types/index.js';

import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { KzeroContext } from '../../context/KzeroContext.js';
import { useKzero } from '../useKzero.js';

describe('useKzero', () => {
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

  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();
  const mockSwitchAccount = vi.fn();
  const mockSendTransaction = vi.fn();
  const mockSignMessage = vi.fn();
  const mockShowWallet = vi.fn();
  const mockHideWallet = vi.fn();
  const mockHandleIframeLoad = vi.fn();

  const mockContextValue = {
    walletUrl: 'https://wallet.example.com',
    accounts: [mockAccount],
    currentAccount: mockAccount,
    isConnected: true,
    isWalletVisible: false,
    connect: mockConnect,
    disconnect: mockDisconnect,
    switchAccount: mockSwitchAccount,
    sendTransaction: mockSendTransaction,
    signMessage: mockSignMessage,
    showWallet: mockShowWallet,
    hideWallet: mockHideWallet,
    handleIframeLoad: mockHandleIframeLoad
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <KzeroContext.Provider value={mockContextValue}>{children}</KzeroContext.Provider>
  );

  it('returns all context values', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.accounts).toEqual([mockAccount]);
    expect(result.current.account).toEqual(mockAccount);
    expect(result.current.isConnected).toBe(true);
  });

  it('exposes connect function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.connect).toBe(mockConnect);
  });

  it('exposes disconnect function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.disconnect).toBe(mockDisconnect);
  });

  it('exposes switchAccount function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.switchAccount).toBe(mockSwitchAccount);
  });

  it('exposes sendTransaction function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.sendTransaction).toBe(mockSendTransaction);
  });

  it('exposes signMessage function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.signMessage).toBe(mockSignMessage);
  });

  it('exposes showWallet function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.showWallet).toBe(mockShowWallet);
  });

  it('exposes hideWallet function', () => {
    const { result } = renderHook(() => useKzero(), { wrapper });

    expect(result.current.hideWallet).toBe(mockHideWallet);
  });

  it('throws error when used outside KzeroProvider', () => {
    expect(() => {
      renderHook(() => useKzero());
    }).toThrow('useKzeroContext must be used within KzeroProvider');
  });

  describe('integration with context', () => {
    it('returns empty accounts when not connected', () => {
      const disconnectedContextValue = {
        ...mockContextValue,
        accounts: [],
        currentAccount: null,
        isConnected: false
      };

      const disconnectedWrapper = ({ children }: { children: React.ReactNode }) => (
        <KzeroContext.Provider value={disconnectedContextValue}>{children}</KzeroContext.Provider>
      );

      const { result } = renderHook(() => useKzero(), { wrapper: disconnectedWrapper });

      expect(result.current.accounts).toEqual([]);
      expect(result.current.account).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it('can call connect and get expected type', async () => {
      mockConnect.mockResolvedValue(undefined);

      const { result } = renderHook(() => useKzero(), { wrapper });

      const connectPromise = result.current.connect();

      expect(connectPromise).toBeInstanceOf(Promise);
      await expect(connectPromise).resolves.toBeUndefined();
    });

    it('can call disconnect and get expected type', async () => {
      mockDisconnect.mockResolvedValue(undefined);

      const { result } = renderHook(() => useKzero(), { wrapper });

      const disconnectPromise = result.current.disconnect();

      expect(disconnectPromise).toBeInstanceOf(Promise);
      await expect(disconnectPromise).resolves.toBeUndefined();
    });

    it('can call switchAccount with address', async () => {
      mockSwitchAccount.mockResolvedValue(undefined);

      const { result } = renderHook(() => useKzero(), { wrapper });

      await result.current.switchAccount('0xabcdef');

      expect(mockSwitchAccount).toHaveBeenCalledWith('0xabcdef');
    });

    it('can call sendTransaction with transaction request', async () => {
      const mockTxRequest: TransactionRequest = {
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x123',
        era: '0x0',
        genesisHash: '0xdef',
        method: '0x1234',
        nonce: '0x0',
        specVersion: '0x1',
        tip: '0x0',
        transactionVersion: '0x1',
        signedExtensions: [],
        version: 4
      };

      const mockTxResponse: TransactionResponse = {
        id: '1',
        signature: '0xsig',
        signedTransaction: '0xsignedtx'
      };

      mockSendTransaction.mockResolvedValue(mockTxResponse);

      const { result } = renderHook(() => useKzero(), { wrapper });

      const response = await result.current.sendTransaction(mockTxRequest);

      expect(mockSendTransaction).toHaveBeenCalledWith(mockTxRequest);
      expect(response).toEqual(mockTxResponse);
    });

    it('can call signMessage with message string', async () => {
      mockSignMessage.mockResolvedValue('0xsignature');

      const { result } = renderHook(() => useKzero(), { wrapper });

      const signature = await result.current.signMessage('test message');

      expect(mockSignMessage).toHaveBeenCalledWith('test message');
      expect(signature).toBe('0xsignature');
    });

    it('can call showWallet', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      result.current.showWallet();

      expect(mockShowWallet).toHaveBeenCalled();
    });

    it('can call hideWallet', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      result.current.hideWallet();

      expect(mockHideWallet).toHaveBeenCalled();
    });
  });

  describe('return type structure', () => {
    it('returns object with correct keys', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      expect(result.current).toHaveProperty('accounts');
      expect(result.current).toHaveProperty('account');
      expect(result.current).toHaveProperty('connect');
      expect(result.current).toHaveProperty('disconnect');
      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('switchAccount');
      expect(result.current).toHaveProperty('signMessage');
      expect(result.current).toHaveProperty('sendTransaction');
      expect(result.current).toHaveProperty('showWallet');
      expect(result.current).toHaveProperty('hideWallet');
    });

    it('does not expose handleIframeLoad (internal)', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      expect(result.current).not.toHaveProperty('handleIframeLoad');
    });

    it('does not expose walletUrl (internal)', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      expect(result.current).not.toHaveProperty('walletUrl');
    });

    it('does not expose isWalletVisible (internal)', () => {
      const { result } = renderHook(() => useKzero(), { wrapper });

      expect(result.current).not.toHaveProperty('isWalletVisible');
    });
  });

  describe('multiple accounts', () => {
    it('returns all accounts in array', () => {
      const account2: ZkAccount = {
        ...mockAccount,
        address: '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      const multiAccountContextValue = {
        ...mockContextValue,
        accounts: [mockAccount, account2]
      };

      const multiAccountWrapper = ({ children }: { children: React.ReactNode }) => (
        <KzeroContext.Provider value={multiAccountContextValue}>{children}</KzeroContext.Provider>
      );

      const { result } = renderHook(() => useKzero(), { wrapper: multiAccountWrapper });

      expect(result.current.accounts).toHaveLength(2);
      expect(result.current.accounts).toEqual([mockAccount, account2]);
    });
  });
});
