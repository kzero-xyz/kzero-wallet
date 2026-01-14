// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { CardData } from './cardStore.js';

import { sessionManager } from './sessionManager.js';

/**
 * Restored state information
 */
export interface RestoredState {
  /**
   * Card data to restore
   */
  cardData: CardData;

  /**
   * Whether we need to resume proof polling
   */
  shouldResumePolling: boolean;
}

/**
 * Restore application state from sessionStorage
 *
 * Decision tree after page refresh:
 * 1. No session → Welcome (null)
 * 2. Has session (from sessionStorage) → LoginSuccess
 *    - User already set PIN and encrypted keypair
 *    - Resume polling if proof not yet generated
 * 3. Proof failed → LoginFailed
 *
 * Note: After page refresh, memorySession is cleared.
 * If session exists, it must be from sessionStorage (encrypted state).
 * The Encrypt flow only happens during initial login, not on restore.
 *
 * @returns Restored state or null if no state to restore
 */
export function restoreState(): RestoredState | null {
  // Check if there's a session in sessionStorage
  const session = sessionManager.getSession();

  if (!session || !session.proof) {
    // No session, go to welcome
    return null;
  }

  // Check if proof generation failed
  if (session.proof.status === 'failed') {
    return {
      cardData: {
        type: 'login-failed',
        error: 'Proof generation failed',
        provider: session.proof.provider
      },
      shouldResumePolling: false
    };
  }

  // Session exists from sessionStorage, user has already set PIN
  // Show login success page
  return {
    cardData: {
      type: 'login-success'
    },
    // Resume polling if proof is not yet generated
    shouldResumePolling: session.proof.status !== 'generated'
  };
}
