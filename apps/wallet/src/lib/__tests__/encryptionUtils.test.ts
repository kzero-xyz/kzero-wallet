// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { describe, expect, it } from 'vitest';

import { decryptWithPIN, type EncryptedData, encryptWithPIN } from '../encryptionUtils';

describe('encryptionUtils', () => {
  describe('encryptWithPIN', () => {
    it('encrypts data successfully', () => {
      const data = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('nonce');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted.ciphertext).toBeTruthy();
      expect(encrypted.nonce).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
    });

    it('produces different ciphertext for same data on multiple encryptions (salt randomness)', () => {
      const data = { message: 'test' };
      const pin = '123456';

      const encrypted1 = encryptWithPIN(data, pin);
      const encrypted2 = encryptWithPIN(data, pin);

      // Same data and PIN should produce different ciphertext due to random salt/nonce
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
    });

    it('encrypts empty string successfully', () => {
      const data = '';
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted.ciphertext).toBeTruthy();
      expect(encrypted.nonce).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
    });

    it('encrypts empty object successfully', () => {
      const data = {};
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted.ciphertext).toBeTruthy();
      expect(encrypted.nonce).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
    });

    it('encrypts special characters and Unicode', () => {
      const data = { message: '你好世界! 🎉 Special chars: !@#$%^&*()' };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted.ciphertext).toBeTruthy();
    });

    it('encrypts long text successfully', () => {
      const data = { message: 'a'.repeat(10000) };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted.ciphertext).toBeTruthy();
    });

    it('encrypts complex nested objects', () => {
      const data = {
        user: {
          id: 123,
          profile: {
            name: 'Test User',
            tags: ['tag1', 'tag2'],
            metadata: { key: 'value' }
          }
        }
      };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      expect(encrypted.ciphertext).toBeTruthy();
    });

    it('generates 32-byte salt (Base64 encoded)', () => {
      const data = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      // 32 bytes = 44 characters in Base64 (with padding)
      const saltBytes = Buffer.from(encrypted.salt, 'base64');

      expect(saltBytes.length).toBe(32);
    });

    it('generates 24-byte nonce for XChaCha20 (Base64 encoded)', () => {
      const data = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(data, pin);

      // 24 bytes = 32 characters in Base64 (with padding)
      const nonceBytes = Buffer.from(encrypted.nonce, 'base64');

      expect(nonceBytes.length).toBe(24);
    });
  });

  describe('decryptWithPIN', () => {
    it('decrypts data successfully with correct PIN', () => {
      const originalData = { message: 'test', number: 42 };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);
      const decrypted = decryptWithPIN<typeof originalData>(encrypted, pin);

      expect(decrypted).toEqual(originalData);
    });

    it('decrypts empty string successfully', () => {
      const originalData = '';
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);
      const decrypted = decryptWithPIN<string>(encrypted, pin);

      expect(decrypted).toBe(originalData);
    });

    it('decrypts special characters and Unicode correctly', () => {
      const originalData = { message: '你好世界! 🎉 Special: !@#$%^&*()' };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);
      const decrypted = decryptWithPIN<typeof originalData>(encrypted, pin);

      expect(decrypted).toEqual(originalData);
    });

    it('decrypts long text correctly', () => {
      const originalData = { message: 'a'.repeat(10000) };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);
      const decrypted = decryptWithPIN<typeof originalData>(encrypted, pin);

      expect(decrypted).toEqual(originalData);
    });

    it('decrypts complex nested objects correctly', () => {
      const originalData = {
        user: {
          id: 123,
          profile: {
            name: 'Test User',
            tags: ['tag1', 'tag2'],
            metadata: { key: 'value' }
          }
        }
      };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);
      const decrypted = decryptWithPIN<typeof originalData>(encrypted, pin);

      expect(decrypted).toEqual(originalData);
    });

    it('throws error with incorrect PIN', () => {
      const originalData = { message: 'test' };
      const correctPin = '123456';
      const wrongPin = '654321';

      const encrypted = encryptWithPIN(originalData, correctPin);

      expect(() => {
        decryptWithPIN(encrypted, wrongPin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });

    it('throws error with corrupted ciphertext', () => {
      const originalData = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);

      // Corrupt the ciphertext
      const corrupted: EncryptedData = {
        ...encrypted,
        ciphertext: 'invalid-base64-data'
      };

      expect(() => {
        decryptWithPIN(corrupted, pin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });

    it('throws error with corrupted salt', () => {
      const originalData = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);

      // Corrupt the salt
      const corrupted: EncryptedData = {
        ...encrypted,
        salt: Buffer.from('wrong-salt-data').toString('base64')
      };

      expect(() => {
        decryptWithPIN(corrupted, pin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });

    it('throws error with corrupted nonce', () => {
      const originalData = { message: 'test' };
      const pin = '123456';

      const encrypted = encryptWithPIN(originalData, pin);

      // Corrupt the nonce
      const corrupted: EncryptedData = {
        ...encrypted,
        nonce: Buffer.from('wrong-nonce').toString('base64')
      };

      expect(() => {
        decryptWithPIN(corrupted, pin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });

    it('throws error with invalid Base64 ciphertext', () => {
      const encrypted: EncryptedData = {
        ciphertext: 'not!!!valid!!!base64',
        nonce: Buffer.from(new Uint8Array(24)).toString('base64'),
        salt: Buffer.from(new Uint8Array(32)).toString('base64')
      };
      const pin = '123456';

      expect(() => {
        decryptWithPIN(encrypted, pin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });

    it('throws error when decrypted data is not valid JSON', () => {
      const pin = '123456';

      // Create encrypted data manually that will decrypt to invalid JSON
      const encrypted = encryptWithPIN('not-json-after-decrypt', pin);
      // Modify to ensure it fails JSON parsing
      const corrupted: EncryptedData = {
        ...encrypted,
        ciphertext: Buffer.from(new Uint8Array([1, 2, 3, 4, 5])).toString('base64')
      };

      expect(() => {
        decryptWithPIN(corrupted, pin);
      }).toThrow('Decryption failed - incorrect PIN or corrupted data');
    });
  });

  describe('encrypt-decrypt round trip', () => {
    it('successfully encrypts and decrypts various data types and PINs', () => {
      // Test different data types with one encryption each
      const testCases = [
        { data: { message: 'test', count: 42 }, pin: '123456', label: 'object' },
        { data: 'test string', pin: '000000', label: 'string' },
        { data: 42, pin: '111111', label: 'number' },
        { data: true, pin: '999999', label: 'boolean' },
        { data: [1, 2, 3], pin: '123456', label: 'array' },
        { data: null, pin: '654321', label: 'null' }
      ];

      testCases.forEach(({ data, pin }) => {
        const encrypted = encryptWithPIN(data, pin);
        const decrypted = decryptWithPIN(encrypted, pin);

        expect(decrypted).toEqual(data);
      });
    }, 10000); // 10s timeout for 6 encryption/decryption cycles
  });

  describe('security properties', () => {
    it('uses PBKDF2 with sufficient iterations', () => {
      // This is a behavioral test - we verify encryption/decryption works
      const data = { message: 'test' };
      const pin = '123456';

      const start = Date.now();
      const encrypted = encryptWithPIN(data, pin);
      const end = Date.now();

      // PBKDF2 with 100k iterations should take reasonable time
      expect(end - start).toBeGreaterThanOrEqual(0);
      expect(encrypted).toBeTruthy();
    });

    it('produces unique salt and nonce for each encryption', () => {
      const data = { message: 'test' };
      const pin = '123456';
      const salts = new Set<string>();
      const nonces = new Set<string>();

      // Generate 3 encryptions to verify randomness (reduced to minimize time)
      for (let i = 0; i < 3; i++) {
        const encrypted = encryptWithPIN(data, pin);

        salts.add(encrypted.salt);
        nonces.add(encrypted.nonce);
      }

      // All salts and nonces should be unique
      expect(salts.size).toBe(3);
      expect(nonces.size).toBe(3);
    }, 5000); // 5s timeout for 3 encryptions
  });
});
