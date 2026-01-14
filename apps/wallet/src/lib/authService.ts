// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex, LoginProvider, Proof, ZkAccount } from '@kzero/zk-core';

import { getProof as getProofFromCore } from '@kzero/zk-core';

/**
 * Authentication status response
 */
export interface AuthStatus {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  account?: ZkAccount;
  error?: string;
}

/**
 * OAuth authentication service
 */
export class AuthService {
  private authEndpoint: string;

  constructor(authEndpoint: string) {
    this.authEndpoint = authEndpoint;
  }

  /**
   * Get OAuth authorization URL
   *
   * @param provider - OAuth provider name
   * @param ephemeralPublicKey - Ephemeral public key for zkLogin
   * @returns Authorization URL
   */
  async getAuthUrl(provider: LoginProvider, ephemeralPublicKey: Hex): Promise<string> {
    try {
      const response = await fetch(`${this.authEndpoint}/auth/${provider}?ephemeral_public_key=${ephemeralPublicKey}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get auth URL: ${response.statusText}`);
      }

      const data = await response.json();

      return data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   *
   * @param sessionId - Session ID (can be ephemeralPublicKey or cookie-based session)
   * @returns Authentication status
   */
  async checkAuthStatus(sessionId?: string): Promise<AuthStatus> {
    try {
      // If sessionId is provided, check specific session
      // Otherwise, check cookie-based session
      const url = sessionId ? `${this.authEndpoint}/auth/status/${sessionId}` : `${this.authEndpoint}/auth/status`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If status check fails, consider it pending
        return { status: 'pending' };
      }

      return response.json();
    } catch (error) {
      console.error('Failed to check auth status:', error);

      return { status: 'pending' };
    }
  }

  /**
   * Wait for authentication completion by polling
   *
   * @param sessionId - Optional session ID
   * @param maxAttempts - Maximum number of poll attempts (default: 60)
   * @param interval - Poll interval in milliseconds (default: 2000)
   * @returns Authentication result
   */
  async waitForAuthCompletion(sessionId?: string, maxAttempts = 60, interval = 2000): Promise<AuthStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.checkAuthStatus(sessionId);

      // If not pending, return result
      if (result.status !== 'pending') {
        return result;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    // Timeout - consider as cancelled
    return {
      status: 'cancelled',
      error: 'Authentication timeout after 2 minutes'
    };
  }

  /**
   * Get zero-knowledge proof for authenticated user
   *
   * @param ephemeralPublicKey - Ephemeral public key used during OAuth
   * @returns Proof object with status and data
   */
  async getProof(ephemeralPublicKey: Hex): Promise<Proof> {
    return getProofFromCore(this.authEndpoint, ephemeralPublicKey);
  }
}
