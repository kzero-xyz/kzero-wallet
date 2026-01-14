// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ZkAccount } from '@kzero/zk-core';

import { Avatar, Box, Button, Popover, type SxProps, Typography } from '@mui/material';
import React from 'react';

import { useKzero } from '@kzero/zk-react';

import IconAvatar from './assets/avatar.svg?react';
import GoogleIcon from './icons/Google';

interface Props {
  wrapperSx?: SxProps;
}

function AccountIcon({ account, wrapperSx }: Props & { account: ZkAccount }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const { disconnect } = useKzero();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          ...wrapperSx
        }}
        onClick={handleClick}
      >
        <IconAvatar />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 320,
              width: anchorEl?.clientWidth,
              borderRadius: '9999px'
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', height: 68, paddingX: 2, gap: 1 }}>
          <Avatar variant='circular' src={account.picture} sx={{ width: 20, height: 20 }}>
            <GoogleIcon style={{ width: 20, height: 20 }} />
          </Avatar>
          <Typography flex='1' fontSize='0.875rem'>
            {account.name}
          </Typography>
          <Button
            size='small'
            color='secondary'
            onClick={disconnect}
            variant='contained'
            sx={{ borderRadius: '9999px' }}
          >
            Sign out
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default AccountIcon;
