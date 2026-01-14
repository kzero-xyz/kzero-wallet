// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { afterEach, describe, expect, it } from 'vitest';

import { getDebugFromUrl, getProvidersFromUrl, getThemeFromUrl } from '../urlParams.js';

describe('urlParams', () => {
  // Store original location
  const originalLocation = window.location;

  // Helper to mock window.location.search
  const mockLocationSearch = (search: string) => {
    delete (window as any).location;
    (window as any).location = { ...originalLocation, search };
  };

  afterEach(() => {
    // Restore original location
    (window as any).location = originalLocation;
  });

  describe('getDebugFromUrl', () => {
    it('returns true when debug=true in URL', () => {
      mockLocationSearch('?debug=true');
      expect(getDebugFromUrl()).toBe(true);
    });

    it('returns false when debug=false in URL', () => {
      mockLocationSearch('?debug=false');
      expect(getDebugFromUrl()).toBe(false);
    });

    it('returns false when debug parameter is missing', () => {
      mockLocationSearch('?other=value');
      expect(getDebugFromUrl()).toBe(false);
    });

    it('returns false when URL has no parameters', () => {
      mockLocationSearch('');
      expect(getDebugFromUrl()).toBe(false);
    });

    it('returns false when debug has any value other than "true"', () => {
      mockLocationSearch('?debug=1');
      expect(getDebugFromUrl()).toBe(false);

      mockLocationSearch('?debug=yes');
      expect(getDebugFromUrl()).toBe(false);

      mockLocationSearch('?debug=TRUE');
      expect(getDebugFromUrl()).toBe(false);
    });

    it('handles debug parameter with other parameters', () => {
      mockLocationSearch('?theme=dark&debug=true&providers=google');
      expect(getDebugFromUrl()).toBe(true);
    });
  });

  describe('getThemeFromUrl', () => {
    it('returns null when theme parameter is missing', () => {
      mockLocationSearch('?debug=true');
      expect(getThemeFromUrl()).toBeNull();
    });

    it('returns null when URL has no parameters', () => {
      mockLocationSearch('');
      expect(getThemeFromUrl()).toBeNull();
    });

    it('returns dark theme preset for theme=dark', () => {
      mockLocationSearch('?theme=dark');
      const theme = getThemeFromUrl();

      expect(theme).toBeDefined();
      expect(theme?.colors.background).toBe('#000000');
      expect(theme?.colors.foreground).toBe('#FFFFFF');
      expect(theme?.colors.primary).toBe('#5328E7');
    });

    it('returns light theme preset for theme=light', () => {
      mockLocationSearch('?theme=light');
      const theme = getThemeFromUrl();

      expect(theme).toBeDefined();
      expect(theme?.colors.background).toBe('#FFFFFF');
      expect(theme?.colors.foreground).toBe('#000000');
      expect(theme?.colors.primary).toBe('#5328E7');
    });

    it('parses custom theme JSON from URL', () => {
      const customTheme = {
        colors: {
          background: '#FF0000',
          foreground: '#00FF00',
          primary: '#0000FF',
          primaryForeground: '#FFFFFF',
          secondary: '#CCCCCC',
          secondaryForeground: '#333333',
          success: '#00FF00',
          successForeground: '#FFFFFF',
          error: '#FF0000',
          errorForeground: '#FFFFFF',
          warning: '#FFFF00',
          warningForeground: '#000000',
          border: '#AAAAAA',
          divider: '#DDDDDD'
        },
        radius: {
          base: '8px',
          card: '16px'
        }
      };

      const encoded = encodeURIComponent(JSON.stringify(customTheme));

      mockLocationSearch(`?theme=${encoded}`);

      const theme = getThemeFromUrl();

      expect(theme).toEqual(customTheme);
    });

    it('returns null for invalid JSON theme', () => {
      mockLocationSearch('?theme=invalid-json');
      expect(getThemeFromUrl()).toBeNull();
    });

    it('returns null for incomplete theme object (missing colors)', () => {
      const incomplete = { radius: { base: '10px', card: '20px' } };
      const encoded = encodeURIComponent(JSON.stringify(incomplete));

      mockLocationSearch(`?theme=${encoded}`);
      expect(getThemeFromUrl()).toBeNull();
    });

    it('returns null for incomplete theme object (missing radius)', () => {
      const incomplete = {
        colors: {
          background: '#FFFFFF',
          foreground: '#000000',
          primary: '#5328E7',
          primaryForeground: '#FFFFFF',
          secondary: '#CCCCCC',
          secondaryForeground: '#333333',
          success: '#00FF00',
          successForeground: '#FFFFFF',
          error: '#FF0000',
          errorForeground: '#FFFFFF',
          warning: '#FFFF00',
          warningForeground: '#000000',
          border: '#AAAAAA',
          divider: '#DDDDDD'
        }
      };
      const encoded = encodeURIComponent(JSON.stringify(incomplete));

      mockLocationSearch(`?theme=${encoded}`);
      expect(getThemeFromUrl()).toBeNull();
    });

    it('handles theme with other URL parameters', () => {
      mockLocationSearch('?debug=true&theme=dark&providers=google');
      const theme = getThemeFromUrl();

      expect(theme).toBeDefined();
      expect(theme?.colors.background).toBe('#000000');
    });
  });

  describe('getProvidersFromUrl', () => {
    it('returns null when providers parameter is missing', () => {
      mockLocationSearch('?debug=true');
      expect(getProvidersFromUrl()).toBeNull();
    });

    it('returns null when URL has no parameters', () => {
      mockLocationSearch('');
      expect(getProvidersFromUrl()).toBeNull();
    });

    it('returns all default providers for providers=default', () => {
      mockLocationSearch('?providers=default');
      const providers = getProvidersFromUrl();

      expect(providers).toEqual(['google', 'twitter', 'apple', 'github', 'telegram', 'discord']);
    });

    it('parses single provider from URL', () => {
      mockLocationSearch('?providers=google');
      expect(getProvidersFromUrl()).toEqual(['google']);
    });

    it('parses multiple comma-separated providers', () => {
      mockLocationSearch('?providers=google,github,twitter');
      expect(getProvidersFromUrl()).toEqual(['google', 'github', 'twitter']);
    });

    it('filters out invalid providers', () => {
      mockLocationSearch('?providers=google,invalid,github,fake');
      expect(getProvidersFromUrl()).toEqual(['google', 'github']);
    });

    it('returns null when all providers are invalid', () => {
      mockLocationSearch('?providers=invalid,fake,wrong');
      expect(getProvidersFromUrl()).toBeNull();
    });

    it('trims whitespace from provider names', () => {
      mockLocationSearch('?providers=google , github , twitter');
      expect(getProvidersFromUrl()).toEqual(['google', 'github', 'twitter']);
    });

    it('handles providers with other URL parameters', () => {
      mockLocationSearch('?debug=true&providers=google,github&theme=dark');
      expect(getProvidersFromUrl()).toEqual(['google', 'github']);
    });

    it('handles all valid provider types', () => {
      mockLocationSearch('?providers=google,twitter,apple,github,telegram,discord');
      const providers = getProvidersFromUrl();

      expect(providers).toContain('google');
      expect(providers).toContain('twitter');
      expect(providers).toContain('apple');
      expect(providers).toContain('github');
      expect(providers).toContain('telegram');
      expect(providers).toContain('discord');
      expect(providers?.length).toBe(6);
    });
  });
});
