// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider, ThemeConfig } from '@kzero/zk-core';

// Predefined themes
const LIGHT_THEME: ThemeConfig = {
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

const DARK_THEME: ThemeConfig = {
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

/**
 * Get debug flag from URL parameters
 * Parent application can enable debug logging by adding ?debug=true to iframe URL
 *
 * @returns true if debug parameter is present and set to 'true'
 */
export function getDebugFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  const debug = params.get('debug');

  return debug === 'true';
}

/**
 * Get theme configuration from URL parameters
 * Supports both preset names ('dark', 'light') and full JSON objects
 *
 * @returns ThemeConfig object or null if no theme parameter found
 */
export function getThemeFromUrl(): ThemeConfig | null {
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme');

  if (!themeParam) {
    return null;
  }

  // Check for preset theme names
  if (themeParam === 'dark') {
    return DARK_THEME;
  }

  if (themeParam === 'light') {
    return LIGHT_THEME;
  }

  // Try to parse as JSON
  try {
    const decoded = decodeURIComponent(themeParam);
    const parsed = JSON.parse(decoded) as ThemeConfig;

    // Basic validation
    if (parsed.colors && parsed.radius) {
      return parsed;
    }

    return null;
  } catch {
    console.warn('Failed to parse theme parameter:', themeParam);

    return null;
  }
}

/**
 * Get providers list from URL parameters
 * Supports both 'default' keyword and comma-separated provider names
 *
 * @returns Array of LoginProvider or null if no providers parameter found
 */
export function getProvidersFromUrl(): LoginProvider[] | null {
  const params = new URLSearchParams(window.location.search);
  const providersParam = params.get('providers');

  if (!providersParam) {
    return null;
  }

  // Check for 'default' keyword
  if (providersParam === 'default') {
    return ['google', 'twitter', 'apple', 'github', 'telegram', 'discord'];
  }

  // Parse comma-separated list
  const providers = providersParam.split(',').map((p) => p.trim()) as LoginProvider[];

  // Validate providers
  const validProviders: LoginProvider[] = ['google', 'twitter', 'apple', 'github', 'telegram', 'discord'];
  const filteredProviders = providers.filter((p) => validProviders.includes(p));

  return filteredProviders.length > 0 ? filteredProviders : null;
}
