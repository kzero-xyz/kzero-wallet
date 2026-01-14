// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex, Proof, ZkAccount } from '@kzero/zk-core';

/**
 * Stored account data in sessionStorage
 * Only stores proof and ephemeralPublicKey, account is derived from proof
 */
interface StoredAccountData {
  ephemeralPublicKey: Hex;
  proof: Proof | null;
  timestamp: number;
}

/**
 * Current account data (computed from stored data)
 */
export interface CurrentAccount {
  account: ZkAccount;
  ephemeralPublicKey: Hex;
  proof: Proof;
  timestamp: number;
}

const CURRENT_PROOF_KEY = 'current_proof';

/**
 * Derive ZkAccount from Proof
 */
function deriveAccountFromProof(proof: Proof, ephemeralPublicKey: Hex): ZkAccount {
  return {
    type: 'zk',
    address: proof.zkAddress!,
    provider: proof.provider,
    ephemeralPublicKey,
    name: proof.name,
    email: proof.email,
    picture: proof.picture,
    proofStatus: proof.status === 'generated' ? 'generated' : proof.status === 'failed' ? 'error' : 'pending'
  };
}

/**
 * Store current account in sessionStorage
 *
 * @param ephemeralPublicKey - Ephemeral public key
 * @param proof - ZK proof (can be null if not yet generated)
 */
export function storeCurrentAccount(ephemeralPublicKey: Hex, proof: Proof | null): void {
  const data: StoredAccountData = {
    ephemeralPublicKey,
    proof,
    timestamp: Date.now()
  };

  sessionStorage.setItem(CURRENT_PROOF_KEY, JSON.stringify(data));
}

/**
 * Get current account from sessionStorage
 * Derives account from stored proof
 *
 * @returns Current account data or null if not found
 */
export function getCurrentAccount(): CurrentAccount | null {
  const stored = sessionStorage.getItem(CURRENT_PROOF_KEY);

  if (!stored) return null;

  try {
    const data = JSON.parse(stored) as StoredAccountData;

    // If no proof, cannot derive account
    if (!data.proof || !data.proof.zkAddress) {
      return null;
    }

    // Derive account from proof
    const account = deriveAccountFromProof(data.proof, data.ephemeralPublicKey);

    return {
      account,
      ephemeralPublicKey: data.ephemeralPublicKey,
      proof: data.proof,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Failed to parse current account:', error);

    return null;
  }
}

/**
 * Remove current account from sessionStorage
 */
export function removeCurrentAccount(): void {
  sessionStorage.removeItem(CURRENT_PROOF_KEY);
}

/**
 * Check if there is a current logged-in account
 *
 * @returns true if account exists
 */
export function hasCurrentAccount(): boolean {
  return getCurrentAccount() !== null;
}
