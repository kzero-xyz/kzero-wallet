// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex, Proof } from './types.js';

import { bnToHex } from '@polkadot/util';

/**
 * Fetches a zero-knowledge proof from the authentication service.
 *
 * The proof status progresses through: waiting → generating → generated (or failed).
 * Poll this function periodically until status is 'generated' or 'failed'.
 *
 * @param baseAuthUrl - Base URL of the authentication service (e.g., 'https://auth.kzero.xyz')
 * @param ephemeralPublicKey - The ephemeral Ed25519 public key (hex format with 0x prefix)
 * @returns Promise resolving to a Proof object containing status and proof data when ready
 * @throws Error if the HTTP request fails or returns non-200 status
 *
 * @example
 * ```typescript
 * const proof = await getProof('https://auth.kzero.xyz', '0x1234...');
 *
 * if (proof.status === 'generated') {
 *   console.log('Proof ready:', proof.proof);
 *   console.log('ZK Address:', proof.zkAddress);
 * } else if (proof.status === 'waiting' || proof.status === 'generating') {
 *   // Poll again after a delay (e.g., 3 seconds)
 *   setTimeout(() => getProof(...), 3000);
 * } else if (proof.status === 'failed') {
 *   console.error('Proof generation failed');
 * }
 * ```
 */
export async function getProof(baseAuthUrl: string, ephemeralPublicKey: Hex): Promise<Proof> {
  return fetch(`${baseAuthUrl}/proof?ephemeral_public_key=${ephemeralPublicKey}`)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }

      throw new Error('Failed to get proof');
    })
    .then((data) => {
      return {
        ...data.results,
        updatedAt: new Date(data.results.updatedAt).getTime(),
        createdAt: new Date(data.results.createdAt).getTime(),
        zkAddress: data.results.addressSeed ? bnToHex(BigInt(data.results.addressSeed)) : undefined,
        ...(data.results.proof ? { proof: JSON.parse(data.results.proof) } : {})
      };
    });
}
