// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { Box, Button, useMediaQuery, useTheme } from '@mui/material';

import { useKzero } from '@kzero/zk-react';

import Authed from './Authed';
import Right from './Right';

function BaseContainer({
  workspaceColor,
  children,
  left,
  walletTheme
}: {
  workspaceColor: string;
  children: React.ReactNode;
  walletTheme: ThemeConfig;
  left?: React.ReactNode;
}) {
  const { account, isConnected, connect, showWallet } = useKzero();

  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        height: 'calc(100dvh - 50px)',
        padding: { xs: 0, sm: 2 },
        paddingTop: 0.8
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: { xs: 'transparent', sm: 'border' },
          overflow: 'auto',
          backgroundColor: workspaceColor,
          backgroundImage:
            'linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
          backgroundSize: '15px 15px'
        }}
        className='no-scrollbar'
      >
        <Box
          sx={{
            width: { xs: '100%', sm: 360 },
            paddingBottom: { xs: '60px', sm: 0 },
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: { xs: 'transparent', sm: 'border' }
          }}
        >
          {downSm && account ? (
            <Box sx={{ padding: 2 }}>
              <Authed account={account} walletTheme={walletTheme} onTransferClick={showWallet} />
            </Box>
          ) : (
            left
          )}
        </Box>

        {/* for mobile */}
        {!account && downSm ? (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: '60px',
              paddingX: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'border'
            }}
          >
            <Button sx={{ height: '40px' }} color='primary' variant='contained' fullWidth onClick={connect}>
              Connect Wallet
            </Button>
          </Box>
        ) : null}

        <Box
          sx={{
            flexGrow: 1,
            padding: 4,
            paddingLeft: 4,
            display: { xs: 'none', sm: 'flex' },
            gap: 4,
            alignItems: 'start',
            overflow: 'auto'
          }}
          className='no-scrollbar'
        >
          {children}
          {isConnected && account ? (
            <Authed account={account} walletTheme={walletTheme} onTransferClick={showWallet} />
          ) : (
            <Right walletTheme={walletTheme} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default BaseContainer;
