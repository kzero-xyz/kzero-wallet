// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { beforeEach, describe, expect, it } from 'vitest';

import { applyTheme } from '../applyTheme.js';

describe('applyTheme', () => {
  const mockTheme: ThemeConfig = {
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
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
      border: '#D9D9D9',
      divider: 'rgba(217, 217, 217, 0.5)'
    },
    radius: {
      base: '10px',
      card: '20px'
    }
  };

  beforeEach(() => {
    // Clear all CSS custom properties before each test
    const root = document.documentElement;

    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--secondary-foreground');
    root.style.removeProperty('--success');
    root.style.removeProperty('--success-foreground');
    root.style.removeProperty('--error');
    root.style.removeProperty('--error-foreground');
    root.style.removeProperty('--warning');
    root.style.removeProperty('--warning-foreground');
    root.style.removeProperty('--border');
    root.style.removeProperty('--divider');
    root.style.removeProperty('--radius');
    root.style.removeProperty('--radius-card');
  });

  it('applies all color properties to CSS custom properties', () => {
    applyTheme(mockTheme);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--background')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--foreground')).toBe('#000000');
    expect(root.style.getPropertyValue('--primary')).toBe('#5328E7');
    expect(root.style.getPropertyValue('--primary-foreground')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--secondary')).toBe('rgba(83, 40, 231, 0.1)');
    expect(root.style.getPropertyValue('--secondary-foreground')).toBe('#5328E7');
    expect(root.style.getPropertyValue('--success')).toBe('#00C414');
    expect(root.style.getPropertyValue('--success-foreground')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--error')).toBe('#FF5310');
    expect(root.style.getPropertyValue('--error-foreground')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--warning')).toBe('#F09337');
    expect(root.style.getPropertyValue('--warning-foreground')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--border')).toBe('#D9D9D9');
    expect(root.style.getPropertyValue('--divider')).toBe('rgba(217, 217, 217, 0.5)');
  });

  it('applies radius properties to CSS custom properties', () => {
    applyTheme(mockTheme);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--radius')).toBe('10px');
    expect(root.style.getPropertyValue('--radius-card')).toBe('20px');
  });

  it('applies dark theme colors correctly', () => {
    const darkTheme: ThemeConfig = {
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

    applyTheme(darkTheme);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--background')).toBe('#000000');
    expect(root.style.getPropertyValue('--foreground')).toBe('#FFFFFF');
    expect(root.style.getPropertyValue('--border')).toBe('#5b5b5b');
    expect(root.style.getPropertyValue('--divider')).toBe('rgba(91, 91, 91, 0.5)');
  });

  it('updates theme when called multiple times', () => {
    const theme1: ThemeConfig = {
      ...mockTheme,
      colors: {
        ...mockTheme.colors,
        background: '#FF0000'
      }
    };

    const theme2: ThemeConfig = {
      ...mockTheme,
      colors: {
        ...mockTheme.colors,
        background: '#00FF00'
      }
    };

    applyTheme(theme1);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--background')).toBe('#FF0000');

    applyTheme(theme2);
    expect(root.style.getPropertyValue('--background')).toBe('#00FF00');
  });

  it('handles RGBA color values', () => {
    applyTheme(mockTheme);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--secondary')).toBe('rgba(83, 40, 231, 0.1)');
    expect(root.style.getPropertyValue('--divider')).toBe('rgba(217, 217, 217, 0.5)');
  });

  it('handles custom radius values', () => {
    const customTheme: ThemeConfig = {
      ...mockTheme,
      radius: {
        base: '5px',
        card: '15px'
      }
    };

    applyTheme(customTheme);

    const root = document.documentElement;

    expect(root.style.getPropertyValue('--radius')).toBe('5px');
    expect(root.style.getPropertyValue('--radius-card')).toBe('15px');
  });

  it('applies theme to document.documentElement', () => {
    applyTheme(mockTheme);

    // Verify that styles are applied to :root element
    const computedStyle = getComputedStyle(document.documentElement);
    const background = computedStyle.getPropertyValue('--background');

    expect(background).toBe('#FFFFFF');
  });
});
