// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Theme } from '@mui/material';
import type { ThemeConfig } from '@kzero/zk-core';

import { createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { createComponents } from './components';
import { createPalette } from './palette';
import { createTypography } from './typography';

type ThemeProviderProps = {
  children: React.ReactNode;
  walletTheme: ThemeConfig;
};

/**
 * Creates a customized version of Material UI theme.
 *
 * @see https://mui.com/customization/theming/
 * @see https://mui.com/customization/default-theme/
 */
function createTheme(walletTheme: ThemeConfig): Theme {
  return createMuiTheme({
    palette: createPalette(walletTheme),
    components: createComponents(),
    typography: createTypography(),
    shape: { borderRadius: 10 },
    shadows: [
      'none',
      `0px 0px 10px 0px rgba(0, 0, 0, 0.06)`,
      `0px 0px 11px 0 rgba(0, 0, 0, 0.07)`,
      `0px 0px 12px 0 rgba(0, 0, 0, 0.08)`,
      `0px 0px 13px 0 rgba(0, 0, 0, 0.09)`,
      `0px 0px 14px 0 rgba(0, 0, 0, 0.10)`,
      `0px 0px 15px 0 rgba(0, 0, 0, 0.11)`,
      `0px 0px 16px 0 rgba(0, 0, 0, 0.12)`,
      `0px 0px 17px 0 rgba(0, 0, 0, 0.13)`,
      `0px 0px 18px 0 rgba(0, 0, 0, 0.14)`,
      `0px 0px 19px 0 rgba(0, 0, 0, 0.15)`,
      `0px 0px 20px 0 rgba(0, 0, 0, 0.16)`,
      `0px 0px 21px 0 rgba(0, 0, 0, 0.17)`,
      `0px 0px 22px 0 rgba(0, 0, 0, 0.18)`,
      `0px 0px 23px 0 rgba(0, 0, 0, 0.19)`,
      `0px 0px 24px 0 rgba(0, 0, 0, 0.20)`,
      `0px 0px 25px 0 rgba(0, 0, 0, 0.21)`,
      `0px 0px 26px 0 rgba(0, 0, 0, 0.22)`,
      `0px 0px 27px 0 rgba(0, 0, 0, 0.23)`,
      `0px 0px 28px 0 rgba(0, 0, 0, 0.24)`,
      `0px 0px 29px 0 rgba(0, 0, 0, 0.25)`,
      `0px 0px 30px 0 rgba(0, 0, 0, 0.26)`,
      `0px 0px 31px 0 rgba(0, 0, 0, 0.27)`,
      `0px 0px 32px 0 rgba(0, 0, 0, 0.28)`,
      `0px 0px 33px 0 rgba(0, 0, 0, 0.29)`
    ],
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1280,
        xl: 1536
      }
    },
    spacing: 10
  });
}

function ThemeProvider({ children, walletTheme }: ThemeProviderProps): React.ReactElement {
  const [theme, setTheme] = React.useState(() => createTheme(walletTheme));

  React.useEffect(() => {
    setTheme(createTheme(walletTheme));
  }, [walletTheme]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default ThemeProvider;
