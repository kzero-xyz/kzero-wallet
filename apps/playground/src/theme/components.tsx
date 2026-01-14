// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeOptions } from '@mui/material/styles';

import { SvgIcon } from '@mui/material';

import IconChecked from '../assets/checked.svg?react';
import IconUnchecked from '../assets/no-checked.svg?react';

type Func = () => NonNullable<ThemeOptions['components']>;
/**
 * Style overrides for Material UI components.
 *
 * @see https://github.com/mui-org/material-ui/tree/master/packages/mui-material/src
 */
const createComponents: Func = () => ({
  MuiCheckbox: {
    defaultProps: {
      icon: <SvgIcon sx={{ fontSize: '1rem' }} inheritViewBox component={IconUnchecked} />,
      checkedIcon: <SvgIcon sx={{ fontSize: '1rem' }} inheritViewBox component={IconChecked} />
    },
    styleOverrides: {
      root: {
        padding: 0
      }
    }
  },

  MuiSwitch: {
    styleOverrides: {
      switchBase: ({ theme }) => ({
        boxSizing: 'border-box',
        top: 0,
        left: 2,
        padding: 0,
        height: '100%',
        color: theme.palette.divider,
        transform: 'translateX(2px)',
        '&.Mui-checked': {
          transform: 'translateX(18px)',
          color: theme.palette.common.white
        },
        '&.Mui-checked+.MuiSwitch-track': {
          opacity: 1,
          borderColor: theme.palette.primary.main
        }
      }),
      thumb: () => ({
        width: 16,
        height: 16,
        backgroundColor: '#FFFFFF'
      }),
      track: ({ theme }) => ({
        boxSizing: 'border-box',
        opacity: 1,
        height: '100%',
        border: '1px solid',
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.border,
        borderRadius: 12
      }),
      root: () => ({
        width: 40,
        height: 24,
        padding: 0
      })
    }
  },

  MuiCardHeader: {
    styleOverrides: {
      root: () => ({
        padding: 0,
        fontWeight: 600
      }),
      title: () => ({
        fontWeight: 600
      })
    }
  },

  MuiCardContent: {
    styleOverrides: {
      root: () => ({
        padding: 0,
        '&:last-child': {
          paddingBottom: 0
        }
      })
    }
  },

  MuiButton: {
    styleOverrides: {
      root: () => ({
        fontWeight: 400,
        textTransform: 'initial'
      })
    }
  },

  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: '1px solid',
        borderColor: theme.palette.divider
      })
    }
  },

  MuiLink: {
    defaultProps: {
      underline: 'hover'
    }
  },

  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: ({ theme }) => ({
        borderColor: theme.palette.border
      })
    }
  }
});

export { createComponents };
