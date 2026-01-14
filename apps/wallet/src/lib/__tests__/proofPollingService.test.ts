// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { AuthService } from '../authService.js';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { proofPollingService } from '../proofPollingService.js';
import { sessionManager } from '../sessionManager.js';

// Mock sessionManager
vi.mock('../sessionManager.js', () => ({
  sessionManager: {
    getSession: vi.fn(),
    updateProof: vi.fn()
  }
}));

describe('proofPollingService', () => {
  const mockSessionManager = sessionManager as any;
  const mockEphemeralPublicKey = '0xabcdef1234567890';

  let mockAuthService: AuthService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockAuthService = {
      getProof: vi.fn()
    } as any;
  });

  afterEach(() => {
    proofPollingService.stop();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('start', () => {
    it('starts polling and calls pollProof immediately', async () => {
      const mockProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: mockProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(mockProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      // Wait for immediate poll only
      await vi.runOnlyPendingTimersAsync();

      expect(mockAuthService.getProof).toHaveBeenCalledWith(mockEphemeralPublicKey);
      expect(mockSessionManager.updateProof).toHaveBeenCalledWith(mockProof);
    });

    it('stops previous polling before starting new one', async () => {
      const mockProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: mockProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(mockProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      expect(proofPollingService.isPolling()).toBe(true);

      proofPollingService.start(mockAuthService, '0xnewkey');

      expect(proofPollingService.isPolling()).toBe(true);
    });
  });

  describe('stop', () => {
    it('stops polling', async () => {
      const mockProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: mockProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(mockProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      expect(proofPollingService.isPolling()).toBe(true);

      proofPollingService.stop();

      expect(proofPollingService.isPolling()).toBe(false);
    });

    it('does nothing if not polling', () => {
      expect(() => proofPollingService.stop()).not.toThrow();
    });
  });

  describe('isPolling', () => {
    it('returns false initially', () => {
      expect(proofPollingService.isPolling()).toBe(false);
    });

    it('returns true after starting', () => {
      const mockProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: mockProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(mockProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      expect(proofPollingService.isPolling()).toBe(true);
    });

    it('returns false after stopping', () => {
      const mockProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: mockProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(mockProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);
      proofPollingService.stop();

      expect(proofPollingService.isPolling()).toBe(false);
    });
  });

  describe('pollProof behavior', () => {
    it('stops polling when session does not exist', async () => {
      mockSessionManager.getSession.mockReturnValue(null);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      // Run only the immediate poll
      await vi.runOnlyPendingTimersAsync();

      expect(proofPollingService.isPolling()).toBe(false);
    });

    it('stops polling when proof status is "generated"', async () => {
      const generatedProof = {
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

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: generatedProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(generatedProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      expect(proofPollingService.isPolling()).toBe(false);
    });

    it('stops polling when proof status is "failed"', async () => {
      const waitingProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const failedProof = {
        ...waitingProof,
        status: 'failed' as const
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: waitingProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(failedProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      expect(mockSessionManager.updateProof).toHaveBeenCalledWith(failedProof);
      expect(proofPollingService.isPolling()).toBe(false);
    });

    it('continues polling when proof status is "waiting"', async () => {
      const waitingProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: waitingProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(waitingProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      expect(proofPollingService.isPolling()).toBe(true);
    });

    it('continues polling when proof status is "generating"', async () => {
      const generatingProof = {
        status: 'generating' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: generatingProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(generatingProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      expect(proofPollingService.isPolling()).toBe(true);
    });

    it('continues polling on error', async () => {
      const waitingProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: waitingProof
      });

      (mockAuthService.getProof as any).mockRejectedValue(new Error('Network error'));

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      // Should continue polling despite error
      expect(proofPollingService.isPolling()).toBe(true);
    });

    it('updates proof in session when fetched', async () => {
      const waitingProof = {
        status: 'waiting' as const,
        provider: 'google' as const,
        zkAddress: undefined,
        addressSeed: '123',
        name: 'Test',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
        proof: null,
        updatedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const generatingProof = {
        ...waitingProof,
        status: 'generating' as const
      };

      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: mockEphemeralPublicKey,
        proof: waitingProof
      });

      (mockAuthService.getProof as any).mockResolvedValue(generatingProof);

      proofPollingService.start(mockAuthService, mockEphemeralPublicKey);

      await vi.runOnlyPendingTimersAsync();

      expect(mockSessionManager.updateProof).toHaveBeenCalledWith(generatingProof);
    });
  });
});
