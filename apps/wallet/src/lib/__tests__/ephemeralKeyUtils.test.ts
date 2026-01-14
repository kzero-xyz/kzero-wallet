// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { describe, expect, it } from 'vitest';

import { generateEphemeralKeypair } from '../ephemeralKeyUtils.js';

describe('ephemeralKeyUtils', () => {
  describe('generateEphemeralKeypair', () => {
    it('generates a valid keypair with publicKey and privateKey', () => {
      const keypair = generateEphemeralKeypair();

      expect(keypair).toHaveProperty('publicKey');
      expect(keypair).toHaveProperty('privateKey');
      expect(typeof keypair.publicKey).toBe('string');
      expect(typeof keypair.privateKey).toBe('string');
    });

    it('generates keys in hex format starting with 0x', () => {
      const keypair = generateEphemeralKeypair();

      expect(keypair.publicKey).toMatch(/^0x[0-9a-f]+$/i);
      expect(keypair.privateKey).toMatch(/^0x[0-9a-f]+$/i);
    });

    it('generates different keypairs on multiple calls', () => {
      const keypair1 = generateEphemeralKeypair();
      const keypair2 = generateEphemeralKeypair();
      const keypair3 = generateEphemeralKeypair();

      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
      expect(keypair2.publicKey).not.toBe(keypair3.publicKey);
      expect(keypair1.privateKey).not.toBe(keypair2.privateKey);
      expect(keypair2.privateKey).not.toBe(keypair3.privateKey);
    });

    it('generates publicKey with correct length (64 bytes + 0x prefix)', () => {
      const keypair = generateEphemeralKeypair();

      // Ed25519 public key is 32 bytes = 64 hex chars + '0x' prefix
      expect(keypair.publicKey.length).toBe(66);
    });

    it('generates privateKey with correct length (64 bytes + 0x prefix)', () => {
      const keypair = generateEphemeralKeypair();

      // Ed25519 private key is 64 bytes = 128 hex chars + '0x' prefix
      expect(keypair.privateKey.length).toBe(130);
    });

    it('generates cryptographically secure random keys', () => {
      const keypairs = Array.from({ length: 10 }, () => generateEphemeralKeypair());

      // Verify all keys are unique
      const publicKeys = new Set(keypairs.map((kp) => kp.publicKey));
      const privateKeys = new Set(keypairs.map((kp) => kp.privateKey));

      expect(publicKeys.size).toBe(10);
      expect(privateKeys.size).toBe(10);
    });

    it('generates valid Ed25519 keypair structure', () => {
      const keypair = generateEphemeralKeypair();

      // Verify the structure matches expected format
      expect(keypair).toEqual({
        publicKey: expect.stringMatching(/^0x[0-9a-f]{64}$/i),
        privateKey: expect.stringMatching(/^0x[0-9a-f]{128}$/i)
      });
    });
  });
});
