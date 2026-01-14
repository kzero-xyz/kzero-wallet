// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex } from '@kzero/zk-core';
import type { AuthService } from './authService.js';

import { Logger } from '@kzero/zk-core';

import { sessionManager } from './sessionManager.js';
import { getDebugFromUrl } from './urlParams.js';

const log = new Logger('ProofPollingService', { enabled: getDebugFromUrl() });

/**
 * Proof polling configuration
 */
const POLL_INTERVAL = 5000; // 5 seconds

/**
 * Proof polling service
 * Polls for updated proof until it reaches 'generated' status
 */
class ProofPollingService {
  private pollingInterval: number | null = null;
  private authService: AuthService | null = null;

  /**
   * Start polling for proof updates
   *
   * @param authService - Authentication service instance
   * @param ephemeralPublicKey - Ephemeral public key to poll for
   */
  start(authService: AuthService, ephemeralPublicKey: Hex): void {
    // Stop any existing polling
    this.stop();

    this.authService = authService;

    // Start polling
    this.pollingInterval = window.setInterval(() => {
      this.pollProof(ephemeralPublicKey);
    }, POLL_INTERVAL);

    // Poll immediately
    this.pollProof(ephemeralPublicKey);

    log.debug('Started polling for proof:', ephemeralPublicKey);
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      log.debug('Stopped polling');
    }
  }

  /**
   * Poll for proof and update if needed
   */
  private async pollProof(ephemeralPublicKey: Hex): Promise<void> {
    if (!this.authService) return;

    try {
      // Get current session to check if we should continue polling
      const currentSession = sessionManager.getSession();

      if (!currentSession) {
        log.debug('No active session, stopping polling');
        this.stop();

        return;
      }

      // Check if proof is already in 'generated' status
      if (currentSession.proof && currentSession.proof.status === 'generated') {
        log.debug('Proof already generated, stopping polling');
        this.stop();

        return;
      }

      // Fetch latest proof from backend
      const proof = await this.authService.getProof(ephemeralPublicKey);

      log.debug('Polled proof status:', proof.status);

      // Update proof in session
      sessionManager.updateProof(proof);

      // Stop polling if proof is now generated
      if (proof.status === 'generated') {
        log.debug('Proof generated, stopping polling');
        this.stop();
      } else if (proof.status === 'failed') {
        log.error('Proof generation failed, stopping polling');
        this.stop();
      }
    } catch (error) {
      log.error('Error polling proof:', error);
      // Continue polling on error (might be temporary network issue)
    }
  }

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return this.pollingInterval !== null;
  }
}

// Export singleton instance
export const proofPollingService = new ProofPollingService();
