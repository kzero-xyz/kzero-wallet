// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - disable type checking for this test file
import type { Proof } from '@kzero/zk-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sessionManager } from '../sessionManager';

// Mock dependencies
vi.mock('../ephemeralKeyUtils', () => ({
  generateEphemeralKeypair: vi.fn(() => ({
    publicKey: '0xabcdef1234567890',
    privateKey: '0x1234567890abcdef'
  }))
}));

vi.mock('../urlParams', () => ({
  getDebugFromUrl: vi.fn(() => false)
}));

describe('SessionManager', () => {
  // Mock proof data
  const mockProof: Proof = {
    status: 'generated',
    zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
    provider: 'google',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
    updatedAt: Date.now(),
    createdAt: Date.now(),
    proof: { data: 'proof-data' }
  };

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    // Terminate any existing session
    sessionManager.terminate();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('generates ephemeral keypair and stores in memory', () => {
      const result = sessionManager.initialize();

      expect(result.ephemeralPublicKey).toBe('0xabcdef1234567890');
    });

    it('clears any existing session before initializing', () => {
      // First initialization
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      // Second initialization should clear the first
      sessionManager.initialize();

      const session = sessionManager.getSession();

      expect(session?.state).toBe('initialized');
      expect(session?.proof).toBeNull();
    });

    it('returns session with initialized state', () => {
      sessionManager.initialize();

      const session = sessionManager.getSession();

      expect(session?.state).toBe('initialized');
      expect(session?.ephemeralPublicKey).toBe('0xabcdef1234567890');
      expect(session?.proof).toBeNull();
      expect(session?.account).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('stores proof after OAuth authentication', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const session = sessionManager.getSession();

      expect(session?.proof).toEqual(mockProof);
      expect(session?.state).toBe('authenticated');
    });

    it('derives account from proof', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const session = sessionManager.getSession();

      expect(session?.account).toBeDefined();
      expect(session?.account?.address).toBe(mockProof.zkAddress);
      expect(session?.account?.provider).toBe('google');
      expect(session?.account?.name).toBe('Test User');
    });

    it('throws error if no active session', () => {
      expect(() => {
        sessionManager.authenticate(mockProof);
      }).toThrow('No active session. Call initialize() first.');
    });

    it('updates proof status in session', () => {
      sessionManager.initialize();

      const waitingProof: Proof = {
        ...mockProof,
        status: 'waiting',
        zkAddress: undefined
      };

      sessionManager.authenticate(waitingProof);

      const session = sessionManager.getSession();

      expect(session?.proof?.status).toBe('waiting');
      // Account is still derived even without zkAddress in the current implementation
      expect(session?.account).toBeDefined();
      expect(session?.account?.address).toBeUndefined();
    });
  });

  describe('encrypt', () => {
    it('encrypts keypair with PIN and persists to sessionStorage', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      const stored = sessionStorage.getItem('kzero_session');

      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);

      expect(parsed.ephemeralPublicKey).toBe('0xabcdef1234567890');
      expect(parsed.encryptedKeypair).toBeDefined();
      expect(parsed.proof).toEqual(mockProof);
    });

    it('clears memory session after encryption (security)', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      // Before encryption, should use memory session
      const beforeSession = sessionManager.getSession();

      expect(beforeSession?.state).toBe('authenticated');

      sessionManager.encrypt('123456');

      // After encryption, should use sessionStorage
      const afterSession = sessionManager.getSession();

      expect(afterSession?.state).toBe('active');
    });

    it('throws error if no active session', () => {
      expect(() => {
        sessionManager.encrypt('123456');
      }).toThrow('No active session to encrypt.');
    });

    it('throws error if no proof available', () => {
      sessionManager.initialize();

      expect(() => {
        sessionManager.encrypt('123456');
      }).toThrow('No proof available. Complete authentication first.');
    });

    it('emits account change event after encryption', () => {
      const callback = vi.fn();

      sessionManager.onAccountChange(callback);

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          address: mockProof.zkAddress
        })
      );
    });
  });

  describe('getKeypair', () => {
    it('returns keypair from memory session (before encryption)', () => {
      sessionManager.initialize();

      const keypair = sessionManager.getKeypair('any-pin');

      expect(keypair.publicKey).toBe('0xabcdef1234567890');
      expect(keypair.privateKey).toBe('0x1234567890abcdef');
    });

    it('decrypts and returns keypair from sessionStorage (after encryption)', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      const keypair = sessionManager.getKeypair('123456');

      expect(keypair.publicKey).toBe('0xabcdef1234567890');
      expect(keypair.privateKey).toBe('0x1234567890abcdef');
    });

    it('throws error with incorrect PIN', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(() => {
        sessionManager.getKeypair('wrong-pin');
      }).toThrow('Failed to decrypt keypair. Incorrect PIN?');
    });

    it('throws error if no active session', () => {
      expect(() => {
        sessionManager.getKeypair('123456');
      }).toThrow('No active session found.');
    });
  });

  describe('updateProof', () => {
    it('updates proof in memory session', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const updatedProof: Proof = {
        ...mockProof,
        status: 'generating'
      };

      sessionManager.updateProof(updatedProof);

      const session = sessionManager.getSession();

      expect(session?.proof?.status).toBe('generating');
    });

    it('updates proof in sessionStorage', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      const updatedProof: Proof = {
        ...mockProof,
        name: 'Updated Name'
      };

      sessionManager.updateProof(updatedProof);

      const stored = sessionStorage.getItem('kzero_session');
      const parsed = JSON.parse(stored!);

      expect(parsed.proof.name).toBe('Updated Name');
    });

    it('emits account change event when proof has zkAddress', () => {
      const callback = vi.fn();

      sessionManager.onAccountChange(callback);

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      callback.mockClear();

      const updatedProof: Proof = {
        ...mockProof,
        name: 'New Name'
      };

      sessionManager.updateProof(updatedProof);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          address: mockProof.zkAddress,
          name: 'New Name'
        })
      );
    });

    it('does not emit account change if no zkAddress in memory session', () => {
      const callback = vi.fn();

      sessionManager.onAccountChange(callback);

      sessionManager.initialize();

      // Clear any existing calls from initialize
      callback.mockClear();

      const waitingProof: Proof = {
        ...mockProof,
        status: 'waiting',
        zkAddress: undefined
      };

      // updateProof only emits if zkAddress exists
      sessionManager.updateProof(waitingProof);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      const session = sessionManager.getSession();

      expect(session).toBeNull();
    });

    it('returns initialized state for memory session without proof', () => {
      sessionManager.initialize();

      const session = sessionManager.getSession();

      expect(session?.state).toBe('initialized');
      expect(session?.proof).toBeNull();
      expect(session?.account).toBeNull();
    });

    it('returns authenticated state for memory session with proof', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const session = sessionManager.getSession();

      expect(session?.state).toBe('authenticated');
      expect(session?.proof).toEqual(mockProof);
      expect(session?.account).toBeDefined();
    });

    it('returns active state for sessionStorage with generated proof', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      const session = sessionManager.getSession();

      expect(session?.state).toBe('active');
    });

    it('returns encrypted state for sessionStorage with non-generated proof', () => {
      sessionManager.initialize();

      const generatingProof: Proof = {
        ...mockProof,
        status: 'generating'
      };

      sessionManager.authenticate(generatingProof);
      sessionManager.encrypt('123456');

      const session = sessionManager.getSession();

      expect(session?.state).toBe('encrypted');
    });

    it('includes timestamp in session info', () => {
      const beforeTime = Date.now();

      sessionManager.initialize();
      const afterTime = Date.now();

      const session = sessionManager.getSession();

      expect(session?.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(session?.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('restore', () => {
    it('restores session from sessionStorage on page load', () => {
      // Simulate existing session in sessionStorage
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      // Clear memory session to simulate page reload
      sessionManager.memorySession = null;

      const restored = sessionManager.restore();

      expect(restored).toBeDefined();
      expect(restored?.state).toBe('active');
      expect(restored?.ephemeralPublicKey).toBe('0xabcdef1234567890');
    });

    it('returns null if no session to restore', () => {
      const restored = sessionManager.restore();

      expect(restored).toBeNull();
    });
  });

  describe('terminate', () => {
    it('clears memory session', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      sessionManager.terminate();

      const session = sessionManager.getSession();

      expect(session).toBeNull();
    });

    it('clears sessionStorage', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      sessionManager.terminate();

      const stored = sessionStorage.getItem('kzero_session');

      expect(stored).toBeNull();
    });

    it('emits account change event with null account', () => {
      const callback = vi.fn();

      sessionManager.onAccountChange(callback);

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      callback.mockClear();

      sessionManager.terminate();

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('clears all session data', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      sessionManager.terminate();

      expect(sessionManager.hasSession()).toBe(false);
      expect(sessionManager.getEphemeralPublicKey()).toBeNull();
    });
  });

  describe('hasSession', () => {
    it('returns false when no session exists', () => {
      expect(sessionManager.hasSession()).toBe(false);
    });

    it('returns true for memory session', () => {
      sessionManager.initialize();
      expect(sessionManager.hasSession()).toBe(true);
    });

    it('returns true for sessionStorage session', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(sessionManager.hasSession()).toBe(true);
    });
  });

  describe('getEphemeralPublicKey', () => {
    it('returns null when no session exists', () => {
      expect(sessionManager.getEphemeralPublicKey()).toBeNull();
    });

    it('returns public key from memory session', () => {
      sessionManager.initialize();
      expect(sessionManager.getEphemeralPublicKey()).toBe('0xabcdef1234567890');
    });

    it('returns public key from sessionStorage', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(sessionManager.getEphemeralPublicKey()).toBe('0xabcdef1234567890');
    });
  });

  describe('account change listeners', () => {
    it('registers listener and returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = sessionManager.onAccountChange(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('calls listener when account changes', () => {
      const callback = vi.fn();

      sessionManager.onAccountChange(callback);

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      // Encrypt triggers account change
      sessionManager.encrypt('123456');

      expect(callback).toHaveBeenCalled();
    });

    it('unsubscribes listener correctly', () => {
      const callback = vi.fn();
      const unsubscribe = sessionManager.onAccountChange(callback);

      unsubscribe();

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(callback).not.toHaveBeenCalled();
    });

    it('supports multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      sessionManager.onAccountChange(callback1);
      sessionManager.onAccountChange(callback2);

      sessionManager.initialize();
      sessionManager.authenticate(mockProof);
      sessionManager.encrypt('123456');

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('sessionStorage error handling', () => {
    it('handles corrupted sessionStorage data', () => {
      sessionStorage.setItem('kzero_session', 'invalid-json');

      const session = sessionManager.getSession();

      expect(session).toBeNull();
    });

    it('handles missing proof in sessionStorage', () => {
      const storedData = {
        ephemeralPublicKey: '0xabcdef',
        encryptedKeypair: {},
        proof: null,
        timestamp: Date.now(),
        version: 1
      };

      sessionStorage.setItem('kzero_session', JSON.stringify(storedData));

      const session = sessionManager.getSession();

      expect(session).toBeNull();
    });
  });

  describe('account derivation', () => {
    it('derives correct account structure from proof', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const session = sessionManager.getSession();
      const account = session?.account;

      expect(account).toEqual({
        type: 'zk',
        address: mockProof.zkAddress,
        provider: 'google',
        ephemeralPublicKey: '0xabcdef1234567890',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proofStatus: 'generated'
      });
    });

    it('maps generated proof status correctly', () => {
      sessionManager.initialize();
      sessionManager.authenticate(mockProof);

      const session = sessionManager.getSession();

      expect(session?.account?.proofStatus).toBe('generated');
    });

    it('maps failed proof status to error', () => {
      sessionManager.initialize();

      const failedProof: Proof = {
        ...mockProof,
        status: 'failed'
      };

      sessionManager.authenticate(failedProof);

      const session = sessionManager.getSession();

      expect(session?.account?.proofStatus).toBe('error');
    });

    it('maps other proof statuses to pending', () => {
      sessionManager.initialize();

      const waitingProof: Proof = {
        ...mockProof,
        status: 'waiting',
        zkAddress: '0xabcd' // Need address for account derivation
      };

      sessionManager.authenticate(waitingProof);

      const session = sessionManager.getSession();

      expect(session?.account?.proofStatus).toBe('pending');
    });
  });
});
