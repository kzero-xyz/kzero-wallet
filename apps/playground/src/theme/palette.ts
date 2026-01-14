// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { alpha, type PaletteOptions } from '@mui/material/styles';

import { getBestForegroundColor } from '../utils.js';

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    border: string;
  }
  interface PaletteOptions {
    border: string;
  }
}

/**
 * Customized Material UI color palette.
 *
 * @see https://mui.com/customization/palette/
 * @see https://mui.com/customization/default-theme/?expand-path=$.palette
 */
const createPalette = (walletTheme: ThemeConfig): PaletteOptions => {
  const primaryContrastColor = getBestForegroundColor(walletTheme.colors.primary);
  const secondaryColor = alpha(walletTheme.colors.primary, 0.1);
  const dividerColor = alpha(getBestForegroundColor(walletTheme.colors.primary), 0.1);

  return {
    primary: {
      main: walletTheme.colors.primary,
      light: walletTheme.colors.primary,
      dark: walletTheme.colors.primary,
      contrastText: primaryContrastColor
    },
    success: {
      main: walletTheme.colors.success,
      light: walletTheme.colors.success,
      dark: walletTheme.colors.success,
      contrastText: walletTheme.colors.successForeground
    },
    error: {
      main: walletTheme.colors.error,
      light: walletTheme.colors.error,
      dark: walletTheme.colors.error,
      contrastText: walletTheme.colors.errorForeground
    },
    warning: {
      main: walletTheme.colors.warning,
      light: walletTheme.colors.warning,
      dark: walletTheme.colors.warning,
      contrastText: walletTheme.colors.warningForeground
    },
    background: { default: walletTheme.colors.background, paper: walletTheme.colors.background },
    common: { black: '#000000', white: '#FDFCFC' },
    secondary: {
      main: secondaryColor,
      light: secondaryColor,
      dark: secondaryColor,
      contrastText: walletTheme.colors.primary
    },
    text: {
      primary: walletTheme.colors.foreground,
      secondary: alpha(walletTheme.colors.foreground, 0.5),
      disabled: alpha(walletTheme.colors.foreground, 0.38)
    },
    border: walletTheme.colors.border,
    divider: dividerColor,
    action: {
      active: dividerColor,
      activatedOpacity: 0.05,
      hover: secondaryColor,
      hoverOpacity: 0.05,
      selected: secondaryColor,
      selectedOpacity: 0.05,
      disabled: alpha(walletTheme.colors.foreground, 0.26),
      disabledBackground: alpha(walletTheme.colors.foreground, 0.12),
      disabledOpacity: 0.38,
      focus: dividerColor,
      focusOpacity: 0.12
    }
  };
};

export { createPalette };
