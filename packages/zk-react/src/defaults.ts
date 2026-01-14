// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

// Re-export ThemeConfig from zk-core for consistency
export type { ThemeConfig } from '@kzero/zk-core';

/**
 * Default light theme configuration
 */
export const lightTheme: ThemeConfig = {
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

/**
 * Default dark theme configuration
 */
export const darkTheme: ThemeConfig = {
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
