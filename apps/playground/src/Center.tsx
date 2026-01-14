// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Box } from '@mui/material';

import { useKzero, WalletCard } from '@kzero/zk-react';

function Center() {
  const { account, isConnected } = useKzero();

  // Before login: show embedded WalletCard
  if (!isConnected && !account) {
    return (
      <Box sx={({ shadows }) => ({ '&>iframe': { boxShadow: shadows[1] } })}>
        <WalletCard style={{ width: 320 }} />
      </Box>
    );
  }

  return null;
}

export default Center;
