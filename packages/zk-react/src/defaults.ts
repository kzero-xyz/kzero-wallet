// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';
import type { BaseWalletTheme, WalletTheme } from './types.js';

const baseTheme: BaseWalletTheme = {
  radius: {
    card: '20px',
    button: '10px'
  }
};

export const lightTheme: WalletTheme = {
  ...baseTheme,
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primaryColor: '#5328E7',
    primaryContrastColor: '#FFFFFF',
    secondaryColor: 'rgba(83, 40, 231, 0.1)',
    secondaryContrastColor: '#5328E7',
    successColor: '#00C414',
    successContrastColor: '#FFFFFF',
    errorColor: '#FF5310',
    errorContrastColor: '#FFFFFF',
    warningColor: '#F09337',
    warningContrastColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    dividerColor: 'rgba(0, 0, 0, 0.1)'
  },
  button: {
    disabledBackgroundColor: '#D9D9D9',
    disabledTextColor: '#FFFFFF'
  }
};

export const darkTheme: WalletTheme = {
  ...baseTheme,
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    primaryColor: '#5328E7',
    primaryContrastColor: '#FFFFFF',
    secondaryColor: 'rgba(83, 40, 231, 0.1)',
    secondaryContrastColor: '#5328E7',
    successColor: '#00FF00',
    successContrastColor: '#FFFFFF',
    errorColor: '#FF5310',
    errorContrastColor: '#FFFFFF',
    warningColor: '#F09337',
    warningContrastColor: '#FFFFFF',
    borderColor: '#5b5b5b',
    dividerColor: 'rgba(255, 255, 255, 0.1)'
  },
  button: {
    disabledBackgroundColor: '#D9D9D9',
    disabledTextColor: '#FFFFFF'
  }
};

export const defaultTheme = lightTheme;

export const defaultProviders: LoginProvider[] = ['google', 'twitter'];

// export const walletIframeUrl = 'https://demo-wallet.kzero.xyz';
export const walletIframeUrl = 'http://localhost:5176';
