// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha2';
import { randomBytes } from '@noble/hashes/utils';

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  nonce: string; // Base64 encoded
  salt: string; // Base64 encoded
}

/**
 * Derive encryption key from PIN using PBKDF2
 *
 * @param pin - 6 digit PIN
 * @param salt - Salt for key derivation
 * @returns 32-byte encryption key
 */
function deriveKey(pin: string, salt: Uint8Array): Uint8Array {
  const pinBytes = new TextEncoder().encode(pin);

  // Use PBKDF2 with 100,000 iterations
  return pbkdf2(sha256, pinBytes, salt, { c: 100000, dkLen: 32 });
}

/**
 * Encrypt data using PIN
 *
 * @param data - Data to encrypt (will be JSON stringified)
 * @param pin - 6 digit PIN
 * @returns Encrypted data with nonce and salt
 */
export function encryptWithPIN<T>(data: T, pin: string): EncryptedData {
  // Generate random salt and nonce
  const salt = randomBytes(32);
  const nonce = randomBytes(24); // XChaCha20 uses 24-byte nonce

  // Derive encryption key from PIN
  const key = deriveKey(pin, salt);

  // Convert data to bytes
  const plaintext = new TextEncoder().encode(JSON.stringify(data));

  // Encrypt using XChaCha20-Poly1305
  const cipher = xchacha20poly1305(key, nonce);
  const ciphertext = cipher.encrypt(plaintext);

  // Return base64 encoded values
  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
    salt: Buffer.from(salt).toString('base64')
  };
}

/**
 * Decrypt data using PIN
 *
 * @param encrypted - Encrypted data
 * @param pin - 6 digit PIN
 * @returns Decrypted data
 * @throws Error if decryption fails (wrong PIN or corrupted data)
 */
export function decryptWithPIN<T>(encrypted: EncryptedData, pin: string): T {
  try {
    // Decode base64 values
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
    const nonce = Buffer.from(encrypted.nonce, 'base64');
    const salt = Buffer.from(encrypted.salt, 'base64');

    // Derive encryption key from PIN
    const key = deriveKey(pin, salt);

    // Decrypt using XChaCha20-Poly1305
    const cipher = xchacha20poly1305(key, nonce);
    const plaintext = cipher.decrypt(ciphertext);

    // Convert bytes to string and parse JSON
    const json = new TextDecoder().decode(plaintext);

    return JSON.parse(json);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed - incorrect PIN or corrupted data');
  }
}
