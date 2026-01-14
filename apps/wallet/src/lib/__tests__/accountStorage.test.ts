// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Proof } from '@kzero/zk-core';

import { beforeEach, describe, expect, it } from 'vitest';

import { getCurrentAccount, hasCurrentAccount, removeCurrentAccount, storeCurrentAccount } from '../accountStorage.js';

describe('accountStorage', () => {
  const mockEphemeralPublicKey = '0xabcdef1234567890';

  const mockProofGenerated: Proof = {
    status: 'generated',
    provider: 'google',
    zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
    maxEpoch: '100',
    kid: 1,
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
    proof: {
      proof_points: {
        a: ['1', '2', '3'],
        b: [
          ['1', '2'],
          ['3', '4'],
          ['5', '6']
        ],
        c: ['7', '8', '9']
      },
      iss_base64_details: {
        value: 'test',
        index_mod_4: 0
      },
      header: 'test-header'
    },
    public: ['123'],
    updatedAt: 1704067200000,
    createdAt: 1704067200000
  };

  const mockProofWaiting: Proof = {
    status: 'waiting',
    provider: 'google',
    zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
    maxEpoch: '100',
    kid: 1,
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
    updatedAt: 1704067200000,
    createdAt: 1704067200000
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('storeCurrentAccount', () => {
    it('stores account data to sessionStorage', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const stored = sessionStorage.getItem('current_proof');

      expect(stored).toBeTruthy();
    });

    it('stores correct data structure', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const stored = sessionStorage.getItem('current_proof');
      const parsed = JSON.parse(stored!);

      expect(parsed).toHaveProperty('ephemeralPublicKey', mockEphemeralPublicKey);
      expect(parsed).toHaveProperty('proof');
      expect(parsed).toHaveProperty('timestamp');
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('allows storing null proof (waiting state)', () => {
      storeCurrentAccount(mockEphemeralPublicKey, null);

      const stored = sessionStorage.getItem('current_proof');
      const parsed = JSON.parse(stored!);

      expect(parsed.proof).toBeNull();
      expect(parsed.ephemeralPublicKey).toBe(mockEphemeralPublicKey);
    });

    it('updates timestamp on each store', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const stored1 = sessionStorage.getItem('current_proof');
      const parsed1 = JSON.parse(stored1!);

      // Wait a bit and store again
      setTimeout(() => {
        storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

        const stored2 = sessionStorage.getItem('current_proof');
        const parsed2 = JSON.parse(stored2!);

        expect(parsed2.timestamp).toBeGreaterThanOrEqual(parsed1.timestamp);
      }, 10);
    });

    it('overwrites previous account data', () => {
      const newProof: Proof = {
        status: 'generated',
        provider: 'github',
        zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
        maxEpoch: '100',
        kid: 1,
        name: 'New User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: {
          proof_points: {
            a: ['1', '2', '3'],
            b: [
              ['1', '2'],
              ['3', '4'],
              ['5', '6']
            ],
            c: ['7', '8', '9']
          },
          iss_base64_details: {
            value: 'test',
            index_mod_4: 0
          },
          header: 'test-header'
        },
        public: ['123'],
        updatedAt: 1704067200000,
        createdAt: 1704067200000
      };

      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);
      storeCurrentAccount('0xnewkey', newProof);

      const stored = sessionStorage.getItem('current_proof');
      const parsed = JSON.parse(stored!);

      expect(parsed.ephemeralPublicKey).toBe('0xnewkey');
      expect(parsed.proof.provider).toBe('github');
      expect(parsed.proof.name).toBe('New User');
    });
  });

  describe('getCurrentAccount', () => {
    it('returns null when no account is stored', () => {
      expect(getCurrentAccount()).toBeNull();
    });

    it('retrieves stored account with generated proof', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const account = getCurrentAccount();

      expect(account).toBeDefined();
      expect(account?.ephemeralPublicKey).toBe(mockEphemeralPublicKey);
      expect(account?.proof.status).toBe('generated');
    });

    it('derives account from proof correctly', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const result = getCurrentAccount();

      expect(result?.account).toBeDefined();
      expect(result?.account.type).toBe('zk');
      expect(result?.account.address).toBe(mockProofGenerated.zkAddress);
      expect(result?.account.provider).toBe('google');
      expect(result?.account.name).toBe('Test User');
      expect(result?.account.email).toBe('test@example.com');
      expect(result?.account.picture).toBe('https://example.com/avatar.jpg');
      expect(result?.account.proofStatus).toBe('generated');
    });

    it('returns account even with waiting status', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofWaiting);

      const result = getCurrentAccount();

      expect(result).toBeDefined();
      expect(result?.account.proofStatus).toBe('pending');
      expect(result?.account.address).toBe(mockProofWaiting.zkAddress);
    });

    it('returns null when proof is null', () => {
      storeCurrentAccount(mockEphemeralPublicKey, null);

      expect(getCurrentAccount()).toBeNull();
    });

    it('handles corrupted sessionStorage data gracefully', () => {
      sessionStorage.setItem('current_proof', 'invalid-json');

      expect(getCurrentAccount()).toBeNull();
    });

    it('includes timestamp in returned data', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      const result = getCurrentAccount();

      expect(result?.timestamp).toBeDefined();
      expect(typeof result?.timestamp).toBe('number');
    });

    it('maps proof status "failed" to proofStatus "error"', () => {
      const failedProof: Proof = {
        status: 'failed',
        provider: 'google',
        maxEpoch: '100',
        kid: 1,
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
        updatedAt: 1704067200000,
        createdAt: 1704067200000
      };

      storeCurrentAccount(mockEphemeralPublicKey, failedProof);

      const result = getCurrentAccount();

      expect(result?.account.proofStatus).toBe('error');
    });

    it('maps proof status "waiting" to proofStatus "pending"', () => {
      const waitingProof: Proof = {
        status: 'waiting',
        provider: 'google',
        zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
        maxEpoch: '100',
        kid: 1,
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        updatedAt: 1704067200000,
        createdAt: 1704067200000
      };

      storeCurrentAccount(mockEphemeralPublicKey, waitingProof);

      const result = getCurrentAccount();

      expect(result?.account.proofStatus).toBe('pending');
    });

    it('maps proof status "generating" to proofStatus "pending"', () => {
      const generatingProof: Proof = {
        status: 'generating',
        provider: 'google',
        zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
        maxEpoch: '100',
        kid: 1,
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        updatedAt: 1704067200000,
        createdAt: 1704067200000
      };

      storeCurrentAccount(mockEphemeralPublicKey, generatingProof);

      const result = getCurrentAccount();

      expect(result?.account.proofStatus).toBe('pending');
    });
  });

  describe('removeCurrentAccount', () => {
    it('removes account from sessionStorage', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);
      expect(sessionStorage.getItem('current_proof')).toBeTruthy();

      removeCurrentAccount();

      expect(sessionStorage.getItem('current_proof')).toBeNull();
    });

    it('does not throw error when no account exists', () => {
      expect(() => removeCurrentAccount()).not.toThrow();
    });

    it('getCurrentAccount returns null after removal', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);
      expect(getCurrentAccount()).toBeDefined();

      removeCurrentAccount();

      expect(getCurrentAccount()).toBeNull();
    });
  });

  describe('hasCurrentAccount', () => {
    it('returns false when no account is stored', () => {
      expect(hasCurrentAccount()).toBe(false);
    });

    it('returns true when account with generated proof exists', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);

      expect(hasCurrentAccount()).toBe(true);
    });

    it('returns true when proof is in waiting status', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofWaiting);

      expect(hasCurrentAccount()).toBe(true);
    });

    it('returns false when proof is null', () => {
      storeCurrentAccount(mockEphemeralPublicKey, null);

      expect(hasCurrentAccount()).toBe(false);
    });

    it('returns false after account is removed', () => {
      storeCurrentAccount(mockEphemeralPublicKey, mockProofGenerated);
      expect(hasCurrentAccount()).toBe(true);

      removeCurrentAccount();

      expect(hasCurrentAccount()).toBe(false);
    });
  });
});
