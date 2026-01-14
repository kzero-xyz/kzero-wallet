// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Legacy wallet theme type for playground compatibility
 */
export interface WalletTheme {
  colors: {
    background: string;
    text: string;
    borderColor: string;
    primaryColor: string;
    primaryContrastColor: string;
    secondaryColor: string;
    secondaryContrastColor: string;
    dividerColor: string;
    successColor: string;
    successContrastColor: string;
    errorColor: string;
    errorContrastColor: string;
    warningColor: string;
    warningContrastColor: string;
  };
  radius: {
    card: string;
    button: string;
  };
  customHeader?: string;
}
