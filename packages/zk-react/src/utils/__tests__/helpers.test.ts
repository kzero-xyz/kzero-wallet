// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { describe, expect, it } from 'vitest';

import { getOriginFromUrl } from '../helpers.js';

describe('helpers', () => {
  describe('getOriginFromUrl', () => {
    it('extracts origin from valid HTTPS URL', () => {
      const url = 'https://example.com/path?query=value';

      expect(getOriginFromUrl(url)).toBe('https://example.com');
    });

    it('extracts origin from valid HTTP URL', () => {
      const url = 'http://example.com/path';

      expect(getOriginFromUrl(url)).toBe('http://example.com');
    });

    it('includes port number in origin', () => {
      const url = 'https://example.com:8080/path';

      expect(getOriginFromUrl(url)).toBe('https://example.com:8080');
    });

    it('handles localhost URLs', () => {
      const url = 'http://localhost:3000/app';

      expect(getOriginFromUrl(url)).toBe('http://localhost:3000');
    });

    it('handles URLs with subdomains', () => {
      const url = 'https://api.example.com/v1/users';

      expect(getOriginFromUrl(url)).toBe('https://api.example.com');
    });

    it('throws error for invalid URL', () => {
      const invalidUrl = 'not-a-valid-url';

      expect(() => getOriginFromUrl(invalidUrl)).toThrow('Invalid URL: not-a-valid-url');
    });

    it('throws error for empty string', () => {
      expect(() => getOriginFromUrl('')).toThrow('Invalid URL: ');
    });

    it('throws error for malformed URL', () => {
      const malformedUrl = 'http://';

      expect(() => getOriginFromUrl(malformedUrl)).toThrow('Invalid URL: http://');
    });

    it('handles URL with fragment', () => {
      const url = 'https://example.com/page#section';

      expect(getOriginFromUrl(url)).toBe('https://example.com');
    });

    it('handles URL with username and password', () => {
      const url = 'https://user:pass@example.com/path';

      expect(getOriginFromUrl(url)).toBe('https://example.com');
    });
  });
});
