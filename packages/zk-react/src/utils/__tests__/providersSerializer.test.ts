// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import { describe, expect, it } from 'vitest';

import { serializeProvidersToUrl } from '../providersSerializer.js';

describe('providersSerializer', () => {
  describe('serializeProvidersToUrl', () => {
    it('returns empty string for undefined providers', () => {
      expect(serializeProvidersToUrl(undefined)).toBe('');
    });

    it('returns empty string for empty array', () => {
      expect(serializeProvidersToUrl([])).toBe('');
    });

    it('returns "default" for full default providers list', () => {
      const defaultProviders: LoginProvider[] = ['google', 'twitter', 'apple', 'github', 'telegram', 'discord'];

      expect(serializeProvidersToUrl(defaultProviders)).toBe('default');
    });

    it('returns "default" for default providers in different order', () => {
      const shuffledProviders: LoginProvider[] = ['discord', 'apple', 'google', 'telegram', 'github', 'twitter'];

      expect(serializeProvidersToUrl(shuffledProviders)).toBe('default');
    });

    it('returns comma-separated list for custom providers', () => {
      const customProviders: LoginProvider[] = ['google', 'github'];

      expect(serializeProvidersToUrl(customProviders)).toBe('google,github');
    });

    it('returns comma-separated list for single provider', () => {
      const singleProvider: LoginProvider[] = ['google'];

      expect(serializeProvidersToUrl(singleProvider)).toBe('google');
    });

    it('does not return "default" for subset of default providers', () => {
      const subset: LoginProvider[] = ['google', 'twitter', 'apple'];

      expect(serializeProvidersToUrl(subset)).not.toBe('default');
      expect(serializeProvidersToUrl(subset)).toBe('google,twitter,apple');
    });

    it('does not return "default" for superset of default providers', () => {
      const superset: LoginProvider[] = [
        'google',
        'twitter',
        'apple',
        'github',
        'telegram',
        'discord',
        'facebook' as LoginProvider
      ];

      expect(serializeProvidersToUrl(superset)).not.toBe('default');
    });

    it('handles providers with duplicates by including them', () => {
      const duplicates: LoginProvider[] = ['google', 'google', 'twitter'];

      expect(serializeProvidersToUrl(duplicates)).toBe('google,google,twitter');
    });

    it('preserves provider order in comma-separated string', () => {
      const ordered: LoginProvider[] = ['discord', 'github', 'google'];

      expect(serializeProvidersToUrl(ordered)).toBe('discord,github,google');
    });
  });
});
