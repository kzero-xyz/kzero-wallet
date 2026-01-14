// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../authService.js';

describe('authService', () => {
  const mockAuthEndpoint = 'https://auth.example.com';
  const mockEphemeralPublicKey = '0xabcdef1234567890';
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockAuthEndpoint);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates instance with auth endpoint', () => {
      expect(authService).toBeInstanceOf(AuthService);
    });
  });

  describe('getAuthUrl', () => {
    it('fetches OAuth authorization URL for google', async () => {
      const mockUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: mockUrl })
      });

      const url = await authService.getAuthUrl('google', mockEphemeralPublicKey);

      expect(url).toBe(mockUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockAuthEndpoint}/auth/google?ephemeral_public_key=${mockEphemeralPublicKey}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('fetches OAuth authorization URL for github', async () => {
      const mockUrl = 'https://github.com/login/oauth/authorize?client_id=456';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: mockUrl })
      });

      const url = await authService.getAuthUrl('github', mockEphemeralPublicKey);

      expect(url).toBe(mockUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockAuthEndpoint}/auth/github?ephemeral_public_key=${mockEphemeralPublicKey}`,
        expect.any(Object)
      );
    });

    it('throws error when API returns non-OK status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(authService.getAuthUrl('google', mockEphemeralPublicKey)).rejects.toThrow(
        'Failed to get auth URL: Internal Server Error'
      );
    });

    it('throws error when network request fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(authService.getAuthUrl('google', mockEphemeralPublicKey)).rejects.toThrow('Network error');
    });

    it('supports all OAuth providers', async () => {
      const providers = ['google', 'github', 'twitter', 'apple', 'telegram', 'discord'] as const;

      for (const provider of providers) {
        const mockUrl = `https://${provider}.example.com/auth`;

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ url: mockUrl })
        });

        const url = await authService.getAuthUrl(provider, mockEphemeralPublicKey);

        expect(url).toBe(mockUrl);
      }
    });
  });

  describe('checkAuthStatus', () => {
    it('checks status without sessionId (cookie-based)', async () => {
      const mockStatus = { status: 'success', account: { address: '0x1234' } };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockStatus
      });

      const status = await authService.checkAuthStatus();

      expect(status).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalledWith(`${mockAuthEndpoint}/auth/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('checks status with sessionId', async () => {
      const mockStatus = { status: 'pending' };
      const sessionId = 'session-123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockStatus
      });

      const status = await authService.checkAuthStatus(sessionId);

      expect(status).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalledWith(`${mockAuthEndpoint}/auth/status/${sessionId}`, expect.any(Object));
    });

    it('returns pending status when API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const status = await authService.checkAuthStatus();

      expect(status).toEqual({ status: 'pending' });
    });

    it('returns pending status when network error occurs', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const status = await authService.checkAuthStatus();

      expect(status).toEqual({ status: 'pending' });
    });

    it('returns success status with account data', async () => {
      const mockAccount = {
        type: 'zk',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        provider: 'google',
        ephemeralPublicKey: '0xabcd',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proofStatus: 'generated'
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', account: mockAccount })
      });

      const status = await authService.checkAuthStatus();

      expect(status.status).toBe('success');
      expect(status.account).toEqual(mockAccount);
    });

    it('returns failed status with error message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'failed', error: 'OAuth failed' })
      });

      const status = await authService.checkAuthStatus();

      expect(status.status).toBe('failed');
      expect(status.error).toBe('OAuth failed');
    });

    it('returns cancelled status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'cancelled' })
      });

      const status = await authService.checkAuthStatus();

      expect(status.status).toBe('cancelled');
    });
  });

  describe('waitForAuthCompletion', () => {
    it('returns immediately when status is not pending', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', account: { address: '0x1234' } })
      });

      const result = await authService.waitForAuthCompletion();

      expect(result.status).toBe('success');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('polls until status changes from pending', async () => {
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;

        if (callCount < 3) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'pending' })
          };
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'success', account: { address: '0x1234' } })
        };
      });

      const result = await authService.waitForAuthCompletion(undefined, 10, 10);

      expect(result.status).toBe('success');
      expect(callCount).toBe(3);
    });

    it('returns cancelled status after max attempts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'pending' })
      });

      const result = await authService.waitForAuthCompletion(undefined, 3, 10);

      expect(result.status).toBe('cancelled');
      expect(result.error).toBe('Authentication timeout after 2 minutes');
    }, 10000);

    it('uses custom interval and max attempts', async () => {
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;

        if (callCount < 2) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ status: 'pending' })
          };
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'success' })
        };
      });

      const result = await authService.waitForAuthCompletion(undefined, 5, 5);

      expect(result.status).toBe('success');
      expect(callCount).toBe(2);
    });
  });

  describe('getProof', () => {
    it('delegates to getProofFromCore', async () => {
      const mockProof = {
        status: 'generated' as const,
        provider: 'google' as const,
        zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
        addressSeed: '12345678901234567890',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: JSON.stringify({ data: 'proof-data' }),
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          results: mockProof
        })
      });

      const proof = await authService.getProof(mockEphemeralPublicKey);

      expect(proof.status).toBe('generated');
      expect(proof.zkAddress).toBeDefined();
      expect(proof.zkAddress).toMatch(/^0x[a-f0-9]+$/);
      // Verify fetch was called (by getProofFromCore internally)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
