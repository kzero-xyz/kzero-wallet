// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getProof } from '../getProof.js';

describe('getProof', () => {
  const baseAuthUrl = 'https://auth.kzero.xyz';
  const ephemeralPublicKey = '0x1234567890abcdef';

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore fetch mock
    vi.unstubAllGlobals();
  });

  describe('successful requests', () => {
    it('fetches proof successfully with status "generated"', async () => {
      const mockResponse = {
        results: {
          status: 'generated',
          addressSeed: '12345678901234567890',
          proof: JSON.stringify({ data: 'proof-data' }),
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(fetch).toHaveBeenCalledWith(`${baseAuthUrl}/proof?ephemeral_public_key=${ephemeralPublicKey}`);
      expect(proof.status).toBe('generated');
      expect(proof.zkAddress).toBeDefined();
      expect(proof.zkAddress).toMatch(/^0x[0-9a-f]+$/i);
      expect((proof as { proof: unknown }).proof).toEqual({ data: 'proof-data' });
      expect(typeof proof.updatedAt).toBe('number');
      expect(typeof proof.createdAt).toBe('number');
    });

    it('fetches proof with status "waiting"', async () => {
      const mockResponse = {
        results: {
          status: 'waiting',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.status).toBe('waiting');
      expect(proof.zkAddress).toBeUndefined();
      expect((proof as unknown as { proof: undefined }).proof).toBeUndefined();
    });

    it('fetches proof with status "generating"', async () => {
      const mockResponse = {
        results: {
          status: 'generating',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.status).toBe('generating');
      expect(proof.zkAddress).toBeUndefined();
    });

    it('fetches proof with status "failed"', async () => {
      const mockResponse = {
        results: {
          status: 'failed',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.status).toBe('failed');
    });

    it('converts BigInt addressSeed to hex with 0x prefix', async () => {
      const mockResponse = {
        results: {
          status: 'generated',
          addressSeed: '999999999999999999999',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.zkAddress).toBeDefined();
      expect(proof.zkAddress).toMatch(/^0x[0-9a-f]+$/i);
    });

    it('converts ISO date strings to timestamps', async () => {
      const mockResponse = {
        results: {
          status: 'waiting',
          updatedAt: '2024-01-15T10:30:45.123Z',
          createdAt: '2024-01-15T10:30:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.updatedAt).toBe(new Date('2024-01-15T10:30:45.123Z').getTime());
      expect(proof.createdAt).toBe(new Date('2024-01-15T10:30:00.000Z').getTime());
    });

    it('parses JSON proof data correctly', async () => {
      const proofData = {
        pi_a: ['123', '456'],
        pi_b: [
          ['789', '012'],
          ['345', '678']
        ],
        pi_c: ['901', '234'],
        protocol: 'groth16'
      };

      const mockResponse = {
        results: {
          status: 'generated',
          addressSeed: '123456',
          proof: JSON.stringify(proofData),
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect((proof as { proof: unknown }).proof).toEqual(proofData);
    });
  });

  describe('error handling', () => {
    it('throws error on HTTP 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      await expect(getProof(baseAuthUrl, ephemeralPublicKey)).rejects.toThrow('Failed to get proof');
    });

    it('throws error on HTTP 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      await expect(getProof(baseAuthUrl, ephemeralPublicKey)).rejects.toThrow('Failed to get proof');
    });

    it('throws error on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(getProof(baseAuthUrl, ephemeralPublicKey)).rejects.toThrow('Network error');
    });

    it('throws error on invalid JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(getProof(baseAuthUrl, ephemeralPublicKey)).rejects.toThrow('Invalid JSON');
    });

    it('handles missing addressSeed gracefully', async () => {
      const mockResponse = {
        results: {
          status: 'waiting',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(proof.zkAddress).toBeUndefined();
    });

    it('handles missing proof gracefully', async () => {
      const mockResponse = {
        results: {
          status: 'generating',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      const proof = await getProof(baseAuthUrl, ephemeralPublicKey);

      expect((proof as unknown as { proof: undefined }).proof).toBeUndefined();
    });
  });

  describe('URL construction', () => {
    it('constructs correct URL with ephemeral public key', async () => {
      const mockResponse = {
        results: {
          status: 'waiting',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      await getProof(baseAuthUrl, ephemeralPublicKey);

      expect(fetch).toHaveBeenCalledWith(`${baseAuthUrl}/proof?ephemeral_public_key=${ephemeralPublicKey}`);
    });

    it('works with different base URLs', async () => {
      const customBaseUrl = 'https://custom-auth.example.com';
      const mockResponse = {
        results: {
          status: 'waiting',
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => mockResponse
      });

      await getProof(customBaseUrl, ephemeralPublicKey);

      expect(fetch).toHaveBeenCalledWith(`${customBaseUrl}/proof?ephemeral_public_key=${ephemeralPublicKey}`);
    });
  });
});
