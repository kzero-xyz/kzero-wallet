// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type { MessageData, SignerPayloadJSON, ZkAccount } from '@kzero/zk-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCardStore } from '../cardStore.js';
import { MessageHandler } from '../messageHandler.js';
import { sessionManager } from '../sessionManager.js';

// Mock dependencies
vi.mock('../sessionManager.js', () => ({
  sessionManager: {
    getSession: vi.fn(),
    terminate: vi.fn()
  }
}));

vi.mock('../applyTheme.js', () => ({
  applyTheme: vi.fn()
}));

vi.mock('../providersManager.js', () => ({
  providersManager: {
    setProviders: vi.fn()
  }
}));

vi.mock('../cardStore.js', () => ({
  useCardStore: {
    getState: vi.fn(() => ({
      navigateTo: vi.fn()
    }))
  }
}));

describe('messageHandler', () => {
  let mockPort: BidirectionalPort<MessageData>;
  let messageHandler: MessageHandler;
  const mockSessionManager = sessionManager as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock port
    mockPort = {
      handle: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      destroy: vi.fn()
    } as any;

    messageHandler = new MessageHandler(mockPort);
  });

  describe('constructor', () => {
    it('registers all handlers and listeners', () => {
      expect(mockPort.handle).toHaveBeenCalledWith('accounts.all', expect.any(Function));
      expect(mockPort.handle).toHaveBeenCalledWith('logout', expect.any(Function));
      expect(mockPort.handle).toHaveBeenCalledWith('sign.request', expect.any(Function));
      expect(mockPort.on).toHaveBeenCalledWith('theme.update', expect.any(Function));
      expect(mockPort.on).toHaveBeenCalledWith('providers.update', expect.any(Function));
      expect(mockPort.on).toHaveBeenCalledWith('sign.cancelled', expect.any(Function));
    });
  });

  describe('handleAccountsAll', () => {
    it('returns empty accounts array when no session', async () => {
      mockSessionManager.getSession.mockReturnValue(null);

      // Get the registered handler
      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'accounts.all');
      const handler = handleCall[1];

      const result = await handler();

      expect(result).toEqual({ accounts: [] });
    });

    it('returns empty accounts array when session has no account', async () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        account: null
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'accounts.all');
      const handler = handleCall[1];

      const result = await handler();

      expect(result).toEqual({ accounts: [] });
    });

    it('returns account when session exists', async () => {
      const mockAccount: ZkAccount = {
        type: 'zk',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        provider: 'google',
        ephemeralPublicKey: '0xabcd',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proofStatus: 'generated'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        account: mockAccount
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'accounts.all');
      const handler = handleCall[1];

      const result = await handler();

      expect(result).toEqual({ accounts: [mockAccount] });
    });
  });

  describe('handleLogout', () => {
    it('terminates session', async () => {
      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'logout');
      const handler = handleCall[1];

      await handler();

      expect(mockSessionManager.terminate).toHaveBeenCalled();
    });

    it('emits account change with null', async () => {
      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'logout');
      const handler = handleCall[1];

      await handler();

      expect(mockPort.emit).toHaveBeenCalledWith('accounts.change', null);
    });

    it('returns null', async () => {
      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'logout');
      const handler = handleCall[1];

      const result = await handler();

      expect(result).toBeNull();
    });
  });

  describe('handleSignRequest', () => {
    it('navigates to sign-extrinsic card', async () => {
      const mockPayload: SignerPayloadJSON = {
        specVersion: '0x00000001',
        transactionVersion: '0x00000001',
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: '0xefgh',
        method: '0x5678',
        nonce: '0x00000000',
        signedExtensions: [],
        tip: '0x00000000',
        version: 4
      };

      const mockNavigateTo = vi.fn();

      (useCardStore.getState as any).mockReturnValue({
        navigateTo: mockNavigateTo
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'sign.request');
      const handler = handleCall[1];

      // Call handler (returns a promise that won't resolve until we call resolveSignRequest)
      const promise = handler(mockPayload, 'https://example.com');

      // Verify navigation happened
      expect(mockNavigateTo).toHaveBeenCalledWith({
        type: 'sign-extrinsic',
        payload: mockPayload,
        origin: 'https://example.com',
        wsEndpoint: undefined // import.meta.env.VITE_WS_ENDPOINT will be undefined in tests
      });

      // Promise should still be pending
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('resolveSignRequest', () => {
    it('resolves pending sign request', async () => {
      const mockPayload: SignerPayloadJSON = {
        specVersion: '0x00000001',
        transactionVersion: '0x00000001',
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: '0xefgh',
        method: '0x5678',
        nonce: '0x00000000',
        signedExtensions: [],
        tip: '0x00000000',
        version: 4
      };

      const mockNavigateTo = vi.fn();

      (useCardStore.getState as any).mockReturnValue({
        navigateTo: mockNavigateTo
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'sign.request');
      const handler = handleCall[1];

      // Create pending sign request
      const promise = handler(mockPayload, 'https://example.com');

      const mockResult = {
        id: '123',
        signature: '0xsignature' as `0x${string}`,
        signedTransaction: '0xtransaction' as `0x${string}`
      };

      // Resolve it
      messageHandler.resolveSignRequest(mockResult);

      // Promise should resolve with result
      const result = await promise;

      expect(result).toEqual(mockResult);
    });

    it('does nothing when no pending request', () => {
      const mockResult = {
        id: '123',
        signature: '0xsignature' as `0x${string}`,
        signedTransaction: '0xtransaction' as `0x${string}`
      };

      expect(() => messageHandler.resolveSignRequest(mockResult)).not.toThrow();
    });
  });

  describe('rejectSignRequest', () => {
    it('rejects pending sign request with error', async () => {
      const mockPayload: SignerPayloadJSON = {
        specVersion: '0x00000001',
        transactionVersion: '0x00000001',
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: '0xefgh',
        method: '0x5678',
        nonce: '0x00000000',
        signedExtensions: [],
        tip: '0x00000000',
        version: 4
      };

      const mockNavigateTo = vi.fn();

      (useCardStore.getState as any).mockReturnValue({
        navigateTo: mockNavigateTo
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'sign.request');
      const handler = handleCall[1];

      // Create pending sign request
      const promise = handler(mockPayload, 'https://example.com');

      // Reject it
      messageHandler.rejectSignRequest('User cancelled');

      // Promise should reject with error
      await expect(promise).rejects.toThrow('User cancelled');
    });

    it('does nothing when no pending request', () => {
      expect(() => messageHandler.rejectSignRequest('Error')).not.toThrow();
    });
  });

  describe('handleSignCancelled', () => {
    it('rejects pending sign request and navigates to welcome', async () => {
      const mockPayload: SignerPayloadJSON = {
        specVersion: '0x00000001',
        transactionVersion: '0x00000001',
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: '0xefgh',
        method: '0x5678',
        nonce: '0x00000000',
        signedExtensions: [],
        tip: '0x00000000',
        version: 4
      };

      const mockNavigateTo = vi.fn();

      (useCardStore.getState as any).mockReturnValue({
        navigateTo: mockNavigateTo
      });

      const handleCall = (mockPort.handle as any).mock.calls.find((call: any) => call[0] === 'sign.request');
      const signHandler = handleCall[1];

      const onCall = (mockPort.on as any).mock.calls.find((call: any) => call[0] === 'sign.cancelled');
      const cancelHandler = onCall[1];

      // Create pending sign request
      const promise = signHandler(mockPayload, 'https://example.com');

      // Trigger cancellation
      cancelHandler();

      // Should reject with cancellation error
      await expect(promise).rejects.toThrow('User cancelled the transaction');

      // Should navigate to welcome
      expect(mockNavigateTo).toHaveBeenCalledWith({ type: 'welcome' });
    });

    it('does nothing when no pending sign request', () => {
      const onCall = (mockPort.on as any).mock.calls.find((call: any) => call[0] === 'sign.cancelled');
      const handler = onCall[1];

      expect(() => handler()).not.toThrow();
    });
  });

  describe('emitAccountChange', () => {
    it('emits account change event', () => {
      const mockAccount: ZkAccount = {
        type: 'zk',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        provider: 'google',
        ephemeralPublicKey: '0xabcd',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proofStatus: 'generated'
      };

      messageHandler.emitAccountChange(mockAccount);

      expect(mockPort.emit).toHaveBeenCalledWith('accounts.change', mockAccount);
    });

    it('emits null account change', () => {
      messageHandler.emitAccountChange(null);

      expect(mockPort.emit).toHaveBeenCalledWith('accounts.change', null);
    });
  });

  describe('destroy', () => {
    it('removes all event listeners and destroys port', () => {
      messageHandler.destroy();

      expect(mockPort.off).toHaveBeenCalledWith('theme.update', expect.any(Function));
      expect(mockPort.off).toHaveBeenCalledWith('providers.update', expect.any(Function));
      expect(mockPort.off).toHaveBeenCalledWith('sign.cancelled', expect.any(Function));
      expect(mockPort.destroy).toHaveBeenCalled();
    });
  });
});
