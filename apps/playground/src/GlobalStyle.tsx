// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { CssBaseline, GlobalStyles } from '@mui/material';

function GlobalStyle() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={() => ({
          body: {
            fontFamily: [
              'Poppins',
              'system-ui',
              '-apple-system',
              'BlinkMacSystemFont',
              "'Segoe UI'",
              'Helvetica',
              'Arial',
              'sans-serif',
              "'Apple Color Emoji'",
              "'Segoe UI Emoji'",
              "'Segoe UI Symbol'"
            ].join(',')
          }
        })}
      />
    </>
  );
}

export default GlobalStyle;
