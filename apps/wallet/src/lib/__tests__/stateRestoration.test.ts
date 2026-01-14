// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sessionManager } from '../sessionManager.js';
import { restoreState } from '../stateRestoration.js';

// Mock sessionManager
vi.mock('../sessionManager.js', () => ({
  sessionManager: {
    getSession: vi.fn()
  }
}));

describe('stateRestoration', () => {
  const mockSessionManager = sessionManager as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('restoreState', () => {
    it('returns null when no session exists', () => {
      mockSessionManager.getSession.mockReturnValue(null);

      const result = restoreState();

      expect(result).toBeNull();
    });

    it('returns null when session has no proof', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: null
      });

      const result = restoreState();

      expect(result).toBeNull();
    });

    it('returns login-failed card when proof status is "failed"', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: {
          status: 'failed',
          provider: 'google',
          zkAddress: null,
          addressSeed: '123',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.jpg',
          proof: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      });

      const result = restoreState();

      expect(result).toBeDefined();
      expect(result?.cardData).toEqual({
        type: 'login-failed',
        error: 'Proof generation failed',
        provider: 'google'
      });
      expect(result?.shouldResumePolling).toBe(false);
    });

    it('returns login-success card when proof is generated', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: {
          status: 'generated',
          provider: 'google',
          zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
          addressSeed: '12345678901234567890',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.jpg',
          proof: JSON.stringify({ data: 'proof-data' }),
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      });

      const result = restoreState();

      expect(result).toBeDefined();
      expect(result?.cardData).toEqual({
        type: 'login-success'
      });
      expect(result?.shouldResumePolling).toBe(false);
    });

    it('returns login-success card with shouldResumePolling=true when proof is waiting', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: {
          status: 'waiting',
          provider: 'google',
          zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
          addressSeed: '12345678901234567890',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.jpg',
          proof: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      });

      const result = restoreState();

      expect(result).toBeDefined();
      expect(result?.cardData).toEqual({
        type: 'login-success'
      });
      expect(result?.shouldResumePolling).toBe(true);
    });

    it('returns login-success card with shouldResumePolling=true when proof is generating', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: {
          status: 'generating',
          provider: 'github',
          zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
          addressSeed: '12345678901234567890',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.jpg',
          proof: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      });

      const result = restoreState();

      expect(result).toBeDefined();
      expect(result?.cardData).toEqual({
        type: 'login-success'
      });
      expect(result?.shouldResumePolling).toBe(true);
    });

    it('correctly determines provider in login-failed card', () => {
      mockSessionManager.getSession.mockReturnValue({
        ephemeralPublicKey: '0xabcd',
        proof: {
          status: 'failed',
          provider: 'github',
          zkAddress: null,
          addressSeed: '123',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/avatar.jpg',
          proof: null,
          updatedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      });

      const result = restoreState();

      expect(result?.cardData).toEqual({
        type: 'login-failed',
        error: 'Proof generation failed',
        provider: 'github'
      });
    });

    it('handles session with all proof providers correctly', () => {
      const providers = ['google', 'github', 'twitter', 'apple', 'telegram', 'discord'] as const;

      providers.forEach((provider) => {
        mockSessionManager.getSession.mockReturnValue({
          ephemeralPublicKey: '0xabcd',
          proof: {
            status: 'generated',
            provider,
            zkAddress: '0x1234567890abcdef1234567890abcdef12345678',
            addressSeed: '12345678901234567890',
            name: 'Test User',
            email: 'test@example.com',
            picture: 'https://example.com/avatar.jpg',
            proof: JSON.stringify({ data: 'proof-data' }),
            updatedAt: '2024-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        });

        const result = restoreState();

        expect(result?.cardData.type).toBe('login-success');
        expect(result?.shouldResumePolling).toBe(false);
      });
    });
  });
});
