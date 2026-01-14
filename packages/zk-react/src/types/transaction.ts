// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { SignerPayloadJSON } from '@kzero/zk-core';

/**
 * Transaction request - input for sendTransaction
 */
export type TransactionRequest = SignerPayloadJSON;

/**
 * Transaction response - output from sendTransaction
 */
export interface TransactionResponse {
  /**
   * Unique transaction identifier
   */
  id: string;

  /**
   * Transaction signature in hex format
   */
  signature: string;

  /**
   * Signed transaction data in hex format
   */
  signedTransaction: string;
}
