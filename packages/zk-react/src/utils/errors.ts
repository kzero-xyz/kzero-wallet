// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Base error class for Kzero SDK errors
 */
export class KzeroError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KzeroError';
    Object.setPrototypeOf(this, KzeroError.prototype);
  }
}

/**
 * Error thrown when wallet connection fails
 */
export class ConnectionError extends KzeroError {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

/**
 * Error thrown when transaction operations fail
 */
export class TransactionError extends KzeroError {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionError';
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}

/**
 * Error thrown when method is not supported
 */
export class NotSupportedError extends KzeroError {
  constructor(message: string) {
    super(message);
    this.name = 'NotSupportedError';
    Object.setPrototypeOf(this, NotSupportedError.prototype);
  }
}
