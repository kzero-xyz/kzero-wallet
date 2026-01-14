// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex } from '@kzero/zk-core';

import { u8aToHex } from '@polkadot/util';
import { ed25519PairFromRandom } from '@polkadot/util-crypto';

/**
 * Ephemeral keypair structure
 */
export interface EphemeralKeypair {
  privateKey: Hex;
  publicKey: Hex;
}

/**
 * Generate a new ephemeral Ed25519 keypair
 *
 * @returns Ephemeral keypair with private and public keys
 */
export function generateEphemeralKeypair(): EphemeralKeypair {
  // random ed25519 keypair
  const keypair = ed25519PairFromRandom();

  return {
    privateKey: u8aToHex(keypair.secretKey),
    publicKey: u8aToHex(keypair.publicKey)
  };
}
