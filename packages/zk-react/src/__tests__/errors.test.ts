// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { describe, expect, it } from 'vitest';

import { ConnectionError, KzeroError, NotSupportedError, TransactionError } from '../utils/errors.js';

describe('Error classes', () => {
  it('should create KzeroError', () => {
    const error = new KzeroError('test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KzeroError);
    expect(error.message).toBe('test error');
    expect(error.name).toBe('KzeroError');
  });

  it('should create ConnectionError', () => {
    const error = new ConnectionError('connection failed');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KzeroError);
    expect(error).toBeInstanceOf(ConnectionError);
    expect(error.message).toBe('connection failed');
    expect(error.name).toBe('ConnectionError');
  });

  it('should create TransactionError', () => {
    const error = new TransactionError('transaction failed');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KzeroError);
    expect(error).toBeInstanceOf(TransactionError);
    expect(error.message).toBe('transaction failed');
    expect(error.name).toBe('TransactionError');
  });

  it('should create NotSupportedError', () => {
    const error = new NotSupportedError('not supported');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KzeroError);
    expect(error).toBeInstanceOf(NotSupportedError);
    expect(error.message).toBe('not supported');
    expect(error.name).toBe('NotSupportedError');
  });
});
