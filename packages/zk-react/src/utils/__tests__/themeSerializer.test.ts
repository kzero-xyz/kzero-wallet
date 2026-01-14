// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { describe, expect, it } from 'vitest';

import { darkTheme, lightTheme } from '../../defaults.js';
import { serializeThemeToUrl } from '../themeSerializer.js';

describe('themeSerializer', () => {
  describe('serializeThemeToUrl', () => {
    it('returns empty string for undefined theme', () => {
      expect(serializeThemeToUrl(undefined)).toBe('');
    });

    it('returns "dark" for dark theme preset', () => {
      expect(serializeThemeToUrl(darkTheme)).toBe('dark');
    });

    it('returns "light" for light theme preset', () => {
      expect(serializeThemeToUrl(lightTheme)).toBe('light');
    });

    it('serializes custom theme as JSON-encoded string', () => {
      const customTheme: ThemeConfig = {
        colors: {
          background: '#FF0000',
          foreground: '#00FF00',
          primary: '#0000FF',
          primaryForeground: '#FFFFFF',
          secondary: '#CCCCCC',
          secondaryForeground: '#333333',
          success: '#00AA00',
          successForeground: '#FFFFFF',
          error: '#AA0000',
          errorForeground: '#FFFFFF',
          warning: '#AAAA00',
          warningForeground: '#000000',
          border: '#DDDDDD',
          divider: '#EEEEEE'
        },
        radius: {
          base: '5px',
          card: '15px'
        }
      };

      const result = serializeThemeToUrl(customTheme);

      // Should be URL-encoded JSON
      expect(result).toBeTruthy();
      expect(result).toContain('%22'); // URL-encoded quote

      // Decode and parse to verify
      const decoded = decodeURIComponent(result);
      const parsed = JSON.parse(decoded);

      expect(parsed).toEqual(customTheme);
    });

    it('detects dark theme even with object spread', () => {
      const spreadTheme = { ...darkTheme };

      expect(serializeThemeToUrl(spreadTheme)).toBe('dark');
    });

    it('detects light theme even with object spread', () => {
      const spreadTheme = { ...lightTheme };

      expect(serializeThemeToUrl(spreadTheme)).toBe('light');
    });

    it('serializes partial custom theme (different background only)', () => {
      const partialCustomTheme: ThemeConfig = {
        ...darkTheme,
        colors: {
          ...darkTheme.colors,
          background: '#111111' // Different from darkTheme
        }
      };

      const result = serializeThemeToUrl(partialCustomTheme);

      // Should NOT be "dark" since background is different
      expect(result).not.toBe('dark');
      expect(result).toBeTruthy();

      // Verify it's JSON-encoded
      const decoded = decodeURIComponent(result);
      const parsed = JSON.parse(decoded);

      expect(parsed.colors.background).toBe('#111111');
    });

    it('serializes partial custom theme (different radius only)', () => {
      const partialCustomTheme: ThemeConfig = {
        ...lightTheme,
        radius: {
          base: '8px', // Different from lightTheme
          card: lightTheme.radius.card
        }
      };

      const result = serializeThemeToUrl(partialCustomTheme);

      // Should NOT be "light" since radius is different
      expect(result).not.toBe('light');
      expect(result).toBeTruthy();

      // Verify it's JSON-encoded
      const decoded = decodeURIComponent(result);
      const parsed = JSON.parse(decoded);

      expect(parsed.radius.base).toBe('8px');
    });

    it('deep equality check works for all color properties', () => {
      // Create a theme identical to darkTheme but constructed differently
      const identicalTheme: ThemeConfig = {
        colors: {
          background: '#000000',
          foreground: '#FFFFFF',
          primary: '#5328E7',
          primaryForeground: '#FFFFFF',
          secondary: 'rgba(83, 40, 231, 0.1)',
          secondaryForeground: '#5328E7',
          success: '#00C414',
          successForeground: '#FFFFFF',
          error: '#FF5310',
          errorForeground: '#FFFFFF',
          warning: '#F09337',
          warningForeground: '#FFFFFF',
          border: '#5b5b5b',
          divider: 'rgba(91, 91, 91, 0.5)'
        },
        radius: {
          base: '10px',
          card: '20px'
        }
      };

      expect(serializeThemeToUrl(identicalTheme)).toBe('dark');
    });

    it('handles themes with special characters in color values', () => {
      const specialTheme: ThemeConfig = {
        ...darkTheme,
        colors: {
          ...darkTheme.colors,
          background: 'rgb(0, 0, 0)', // Different format
          divider: 'rgba(255, 255, 255, 0.1)' // Contains commas and spaces
        }
      };

      const result = serializeThemeToUrl(specialTheme);

      expect(result).toBeTruthy();
      expect(result).not.toBe('dark'); // Different from preset

      // Verify encoding works correctly
      const decoded = decodeURIComponent(result);
      const parsed = JSON.parse(decoded);

      expect(parsed.colors.background).toBe('rgb(0, 0, 0)');
      expect(parsed.colors.divider).toBe('rgba(255, 255, 255, 0.1)');
    });

    it('preserves all theme properties in serialization', () => {
      const fullCustomTheme: ThemeConfig = {
        colors: {
          background: '#100000',
          foreground: '#100001',
          primary: '#100002',
          primaryForeground: '#100003',
          secondary: '#100004',
          secondaryForeground: '#100005',
          success: '#100006',
          successForeground: '#100007',
          error: '#100008',
          errorForeground: '#100009',
          warning: '#10000A',
          warningForeground: '#10000B',
          border: '#10000C',
          divider: '#10000D'
        },
        radius: {
          base: '3px',
          card: '13px'
        }
      };

      const result = serializeThemeToUrl(fullCustomTheme);
      const decoded = decodeURIComponent(result);
      const parsed = JSON.parse(decoded);

      // Verify every property is preserved
      expect(parsed).toEqual(fullCustomTheme);
      expect(parsed.colors.background).toBe('#100000');
      expect(parsed.colors.foreground).toBe('#100001');
      expect(parsed.colors.primary).toBe('#100002');
      expect(parsed.colors.primaryForeground).toBe('#100003');
      expect(parsed.colors.secondary).toBe('#100004');
      expect(parsed.colors.secondaryForeground).toBe('#100005');
      expect(parsed.colors.success).toBe('#100006');
      expect(parsed.colors.successForeground).toBe('#100007');
      expect(parsed.colors.error).toBe('#100008');
      expect(parsed.colors.errorForeground).toBe('#100009');
      expect(parsed.colors.warning).toBe('#10000A');
      expect(parsed.colors.warningForeground).toBe('#10000B');
      expect(parsed.colors.border).toBe('#10000C');
      expect(parsed.colors.divider).toBe('#10000D');
      expect(parsed.radius.base).toBe('3px');
      expect(parsed.radius.card).toBe('13px');
    });
  });
});
